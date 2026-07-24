from __future__ import annotations

import asyncio
import hashlib
from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.database import Base
from app.models.domain_entities import (
    CreditCard,
    CreditCardItemKind,
    CreditCardStatement,
    CreditCardStatementItem,
    Transaction,
)
from app.repositories.credit_card_repo import CreditCardRepository
from app.routers.credit_cards import router
from app.schemas.credit_card import CreditCardStatementExtraction, ExtractedCreditCardItem
from app.services.credit_card_analytics import CreditCardAnalyticsService
from app.services.credit_card_ingestion import (
    CreditCardIngestionService,
    DuplicateCreditCardStatementError,
)


class StubUploadFile:
    filename = "credit-card.pdf"
    content_type = "application/pdf"

    def __init__(self, content: bytes) -> None:
        self.content = content

    async def read(self) -> bytes:
        return self.content


class StubCreditCardIngestionService(CreditCardIngestionService):
    def __init__(
        self, repository: CreditCardRepository, extraction: CreditCardStatementExtraction
    ) -> None:
        super().__init__(repository, Settings(openai_api_key="test"))
        self.extraction = extraction
        self.extraction_called = False

    async def _extract_statement(self, content: bytes) -> CreditCardStatementExtraction:
        self.extraction_called = True
        return self.extraction


def make_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return Session(engine)


def make_extraction() -> CreditCardStatementExtraction:
    return CreditCardStatementExtraction(
        issuer="Test issuer",
        account_number="1234",
        card_name="Test card",
        statement_date=date(2026, 6, 30),
        current_balance=Decimal("100.00"),
        credit_limit=Decimal("1000.00"),
        annual_percentage_rate=Decimal("24.00"),
        items=[
            ExtractedCreditCardItem(
                transaction_date=date(2026, 6, 1),
                description="Groceries",
                category="groceries",
                kind=CreditCardItemKind.PURCHASE,
                amount=Decimal("100.00"),
                installment_number=2,
                installment_total=4,
            )
        ],
    )


def build_blank_pdf() -> bytes:
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
        b"trailer\n<< /Root 1 0 R >>\n%%EOF\n"
    )


def test_extracted_payment_is_stored_as_negative_and_categories_are_strict() -> None:
    payment = ExtractedCreditCardItem(
        transaction_date=date(2026, 6, 2),
        description="Payment received",
        category="others",
        kind=CreditCardItemKind.PAYMENT,
        amount=Decimal("30.00"),
    )

    assert payment.amount == Decimal("-30.00")
    with pytest.raises(ValueError):
        ExtractedCreditCardItem(
            transaction_date=date(2026, 6, 2),
            description="Invalid category",
            category="transport",  # type: ignore[arg-type]
            kind=CreditCardItemKind.PURCHASE,
            amount=Decimal("30.00"),
        )


def test_hybrid_extraction_uses_ocr_for_a_textless_page(monkeypatch: pytest.MonkeyPatch) -> None:
    service = CreditCardIngestionService(
        CreditCardRepository(make_session()), Settings(openai_api_key="test")
    )
    monkeypatch.setattr(service, "_ocr_page", lambda _: "OCR ITEM 50.00")

    text = service._extract_pdf_text(build_blank_pdf())

    assert "--- PAGE 1 (OCR) ---" in text
    assert "OCR ITEM 50.00" in text


def test_ingestion_persists_only_credit_card_records_and_rejects_duplicates() -> None:
    with make_session() as session:
        repository = CreditCardRepository(session)
        service = StubCreditCardIngestionService(repository, make_extraction())
        result = asyncio.run(service.ingest_upload(StubUploadFile(b"%PDF new")))  # type: ignore[arg-type]

        assert result.inserted_items == 1
        assert session.scalar(select(Transaction.id)) is None
        assert session.scalar(select(CreditCardStatementItem.id)) is not None

        duplicate = StubCreditCardIngestionService(repository, make_extraction())
        with pytest.raises(DuplicateCreditCardStatementError):
            asyncio.run(duplicate.ingest_upload(StubUploadFile(b"%PDF new")))  # type: ignore[arg-type]

    assert duplicate.extraction_called is False


def test_credit_card_analytics_returns_latest_metrics_and_item_aggregates() -> None:
    with make_session() as session:
        card = CreditCard(
            issuer="Issuer", account_number="9999", name="Card", currency="COP", credit_limit=1000
        )
        session.add(card)
        session.flush()
        old_statement = CreditCardStatement(
            credit_card_id=card.id,
            file_hash=hashlib.sha256(b"old").hexdigest(),
            file_name="old.pdf",
            statement_date=date(2026, 5, 31),
            current_balance=Decimal("50.00"),
            annual_percentage_rate=Decimal("20.00"),
            credit_limit=Decimal("1000.00"),
        )
        latest_statement = CreditCardStatement(
            credit_card_id=card.id,
            file_hash=hashlib.sha256(b"latest").hexdigest(),
            file_name="latest.pdf",
            statement_date=date(2026, 6, 30),
            current_balance=Decimal("200.00"),
            annual_percentage_rate=Decimal("24.00"),
            credit_limit=Decimal("1000.00"),
        )
        session.add_all([old_statement, latest_statement])
        session.flush()
        session.add_all(
            [
                CreditCardStatementItem(
                    statement_id=latest_statement.id,
                    transaction_date=date(2026, 6, 1),
                    description="Market",
                    category="groceries",
                    kind=CreditCardItemKind.PURCHASE,
                    amount=Decimal("100.00"),
                    installment_number=2,
                    installment_total=4,
                    remaining_amount=Decimal("200.00"),
                ),
                CreditCardStatementItem(
                    statement_id=latest_statement.id,
                    transaction_date=date(2026, 6, 2),
                    description="Payment",
                    category="others",
                    kind=CreditCardItemKind.PAYMENT,
                    amount=Decimal("-50.00"),
                ),
                CreditCardStatementItem(
                    statement_id=latest_statement.id,
                    transaction_date=date(2026, 6, 3),
                    description="Interest",
                    category="others",
                    kind=CreditCardItemKind.INTEREST,
                    amount=Decimal("5.00"),
                ),
            ]
        )
        session.commit()
        service = CreditCardAnalyticsService(CreditCardRepository(session))

        metrics = service.get_metrics()
        activity = service.get_monthly_activity()
        distribution = service.get_category_distribution()

    assert metrics.current_statement_balance == Decimal("200.00")
    assert metrics.credit_utilization == Decimal("20.00")
    assert metrics.available_credit == Decimal("800.00")
    assert metrics.weighted_apr == Decimal("24.00")
    assert metrics.active_plans == 1
    assert activity[0].spending == Decimal("100.00")
    assert activity[0].payments == Decimal("-50.00")
    assert activity[0].interest == Decimal("5.00")
    assert distribution[0].category == "groceries"
    assert distribution[0].percentage == Decimal("100.00")


def test_credit_card_router_exposes_only_independent_endpoints() -> None:
    paths = {route.path for route in router.routes}

    assert paths == {
        "/api/v1/credit-cards/statements/upload",
        "/api/v1/credit-cards/metrics",
        "/api/v1/credit-cards/monthly-activity",
        "/api/v1/credit-cards/category-distribution",
        "/api/v1/credit-cards/statement-items",
    }
