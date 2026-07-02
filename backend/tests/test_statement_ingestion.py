from __future__ import annotations

import asyncio
import hashlib
from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.database import Base
from app.models.domain_entities import (
    Account,
    Bank,
    Category,
    Statement,
    Transaction,
    TransactionType,
)
from app.repositories.finance_repo import FinanceRepository
from app.schemas.statement_ingestion import ExtractedTransaction, StatementExtraction
from app.services.statement_ingestion import DuplicateStatementError, StatementIngestionService


class StubUploadFile:
    filename = "statement.pdf"
    content_type = "application/pdf"

    def __init__(self, content: bytes) -> None:
        self.content = content

    async def read(self) -> bytes:
        return self.content


class StubStatementIngestionService(StatementIngestionService):
    def __init__(
        self, repository: FinanceRepository, settings: Settings, extraction: StatementExtraction
    ):
        super().__init__(repository, settings)
        self.extraction = extraction
        self.extraction_called = False

    async def _extract_statement(self, content: bytes) -> StatementExtraction:
        self.extraction_called = True
        return self.extraction


def make_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return Session(engine)


def make_extraction() -> StatementExtraction:
    return StatementExtraction(
        bank_name="Test Bank",
        account_number="123456",
        account_name="Checking",
        initial_balance=Decimal("100.00"),
        final_balance=Decimal("125.00"),
        total_income=Decimal("50.00"),
        total_expenses=Decimal("25.00"),
        transactions=[
            ExtractedTransaction(
                transaction_date=date(2026, 6, 1),
                description="Payroll",
                amount=Decimal("50.00"),
                type=TransactionType.INCOME,
                bank_id="tx-1",
                balance=Decimal("150.00"),
            ),
            ExtractedTransaction(
                transaction_date=date(2026, 6, 2),
                description="Groceries",
                amount=Decimal("25.00"),
                type=TransactionType.EXPENSE,
                bank_id="tx-2",
                previous_balance=Decimal("150.00"),
                balance=Decimal("125.00"),
                category_name="Groceries",
            ),
        ],
    )


def test_statement_extraction_rejects_unbalanced_totals() -> None:
    with pytest.raises(ValidationError):
        StatementExtraction(
            bank_name="Test Bank",
            account_number="123456",
            initial_balance=Decimal("100.00"),
            final_balance=Decimal("130.00"),
            total_income=Decimal("50.00"),
            total_expenses=Decimal("25.00"),
            transactions=[
                ExtractedTransaction(
                    transaction_date=date(2026, 6, 1),
                    amount=Decimal("50.00"),
                    type=TransactionType.INCOME,
                )
            ],
        )


def test_duplicate_statement_hash_rejects_before_ai_extraction() -> None:
    with make_session() as session:
        bank = Bank(name="Test Bank")
        session.add(bank)
        session.flush()
        content = b"%PDF duplicate"
        session.add(
            Statement(
                bank_id=bank.id,
                file_hash=hashlib.sha256(content).hexdigest(),
                file_name="existing.pdf",
            )
        )
        session.commit()

        service = StubStatementIngestionService(
            FinanceRepository(session), Settings(openai_api_key="test"), make_extraction()
        )

        with pytest.raises(DuplicateStatementError):
            asyncio.run(service.ingest_upload(StubUploadFile(content)))  # type: ignore[arg-type]

    assert service.extraction_called is False


def test_ingestion_skips_duplicate_transactions() -> None:
    with make_session() as session:
        bank = Bank(name="Test Bank")
        session.add(bank)
        session.flush()
        account = Account(
            bank_id=bank.id,
            account_number="123456",
            name="Checking",
            currency="COP",
        )
        category = Category(name="Groceries", type=TransactionType.EXPENSE)
        session.add_all([account, category])
        session.flush()
        session.add(
            Transaction(
                account_id=account.id,
                category_id=category.id,
                amount=Decimal("50.00"),
                transaction_date=date(2026, 6, 1),
                description="Existing payroll",
                bank_id="tx-1",
            )
        )
        session.commit()

        service = StubStatementIngestionService(
            FinanceRepository(session), Settings(openai_api_key="test"), make_extraction()
        )
        result = asyncio.run(service.ingest_upload(StubUploadFile(b"%PDF new")))  # type: ignore[arg-type]
        transactions = list(session.scalars(select(Transaction)).all())

    assert result.inserted_transactions == 1
    assert result.skipped_transactions == 1
    assert len(transactions) == 2
