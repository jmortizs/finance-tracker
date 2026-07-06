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
from app.services.statement_ingestion import (
    CorruptedPdfError,
    DuplicateStatementError,
    ScannedPdfError,
    StatementIngestionService,
)


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


def build_pdf(lines: list[tuple[int, int, str]]) -> bytes:
    """Build a minimal single-page PDF placing each text at explicit (x, y) coordinates."""
    stream_parts = ["BT /F1 12 Tf"]
    for x, y, text in lines:
        stream_parts.append(f"1 0 0 1 {x} {y} Tm ({text}) Tj")
    stream_parts.append("ET")
    stream = "\n".join(stream_parts).encode()

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>"
        ),
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    output = b"%PDF-1.4\n"
    offsets: list[int] = []
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output += f"{index} 0 obj\n".encode() + obj + b"\nendobj\n"

    xref_position = len(output)
    output += f"xref\n0 {len(objects) + 1}\n".encode()
    output += b"0000000000 65535 f \n"
    for offset in offsets:
        output += f"{offset:010d} 00000 n \n".encode()
    output += (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_position}\n%%EOF\n"
    ).encode()
    return output


def make_pdf_service() -> StatementIngestionService:
    return StatementIngestionService(
        FinanceRepository(make_session()), Settings(openai_api_key="test")
    )


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


def test_extracted_transaction_rejects_previous_balance() -> None:
    with pytest.raises(ValidationError):
        ExtractedTransaction(
            transaction_date=date(2026, 6, 2),
            amount=Decimal("25.00"),
            type=TransactionType.EXPENSE,
            previous_balance=Decimal("150.00"),
            balance=Decimal("125.00"),
        )


def test_extract_pdf_text_preserves_tabular_layout() -> None:
    service = make_pdf_service()
    pdf = build_pdf([(72, 720, "01/06/2026"), (250, 720, "GROCERIES"), (450, 720, "25.00")])

    text = service._extract_pdf_text(pdf)

    assert "--- PAGE 1 ---" in text
    row = next(line for line in text.splitlines() if "GROCERIES" in line)
    assert "01/06/2026" in row
    assert "25.00" in row
    assert row.index("01/06/2026") < row.index("GROCERIES") < row.index("25.00")
    # Layout mode must keep the horizontal gaps between columns, not collapse them.
    assert "   " in row.strip()


def test_corrupted_pdf_raises_diagnostic_before_ai_extraction() -> None:
    service = make_pdf_service()

    with pytest.raises(CorruptedPdfError) as excinfo:
        asyncio.run(service.ingest_upload(StubUploadFile(b"this is not a pdf document")))  # type: ignore[arg-type]

    assert excinfo.value.status_code == 400


def test_scanned_pdf_raises_diagnostic_before_ai_extraction() -> None:
    service = make_pdf_service()

    with pytest.raises(ScannedPdfError) as excinfo:
        asyncio.run(service.ingest_upload(StubUploadFile(build_pdf([]))))  # type: ignore[arg-type]

    assert excinfo.value.status_code == 422


def test_extraction_prompt_wraps_layout_text_in_delimiters() -> None:
    service = make_pdf_service()

    prompt = service._build_extraction_prompt("--- PAGE 1 ---\nROW DATA")

    assert "<statement_text>" in prompt
    assert "</statement_text>" in prompt
    assert "--- PAGE 1 ---\nROW DATA" in prompt
    assert prompt.index("<statement_text>") < prompt.index("ROW DATA")


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
