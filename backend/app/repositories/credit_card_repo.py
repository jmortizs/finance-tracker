from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.domain_entities import (
    CreditCard,
    CreditCardItemKind,
    CreditCardStatement,
    CreditCardStatementItem,
)
from app.schemas.credit_card import CreditCardStatementExtraction


class CreditCardRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_statement_by_hash(self, file_hash: str) -> CreditCardStatement | None:
        return self.db.scalars(
            select(CreditCardStatement).where(CreditCardStatement.file_hash == file_hash)
        ).first()

    def get_or_create_card(self, extraction: CreditCardStatementExtraction) -> CreditCard:
        card = self.db.scalars(
            select(CreditCard).where(CreditCard.account_number == extraction.account_number)
        ).first()
        if card is None:
            card = CreditCard(
                issuer=extraction.issuer,
                account_number=extraction.account_number,
                name=extraction.card_name or extraction.account_number,
                currency=extraction.currency,
                credit_limit=extraction.credit_limit,
            )
            self.db.add(card)
            self.db.flush()
        else:
            card.credit_limit = extraction.credit_limit
            card.currency = extraction.currency
        return card

    def create_statement(
        self,
        *,
        credit_card_id: int,
        file_hash: str,
        file_name: str,
        extraction: CreditCardStatementExtraction,
    ) -> CreditCardStatement:
        statement = CreditCardStatement(
            credit_card_id=credit_card_id,
            file_hash=file_hash,
            file_name=file_name,
            statement_date=extraction.statement_date,
            current_balance=extraction.current_balance,
            annual_percentage_rate=extraction.annual_percentage_rate,
            credit_limit=extraction.credit_limit,
        )
        self.db.add(statement)
        self.db.flush()
        return statement

    def create_items(
        self, *, statement_id: int, extraction: CreditCardStatementExtraction
    ) -> list[CreditCardStatementItem]:
        items = [
            CreditCardStatementItem(
                statement_id=statement_id,
                transaction_date=item.transaction_date,
                description=item.description,
                category=item.category,
                kind=item.kind,
                amount=item.amount,
                installment_number=item.installment_number,
                installment_total=item.installment_total,
                remaining_amount=item.remaining_amount,
            )
            for item in extraction.items
        ]
        self.db.add_all(items)
        self.db.flush()
        return items

    def get_latest_statements(self) -> list[CreditCardStatement]:
        statements = self.db.scalars(
            select(CreditCardStatement).order_by(
                CreditCardStatement.credit_card_id,
                CreditCardStatement.statement_date.desc(),
                CreditCardStatement.id.desc(),
            )
        ).all()
        latest: dict[int, CreditCardStatement] = {}
        for statement in statements:
            latest.setdefault(statement.credit_card_id, statement)
        return list(latest.values())

    def get_statement_items(self) -> list[CreditCardStatementItem]:
        return list(
            self.db.scalars(
                select(CreditCardStatementItem).order_by(
                    CreditCardStatementItem.transaction_date.desc(),
                    CreditCardStatementItem.id.desc(),
                )
            ).all()
        )

    def get_monthly_items(
        self,
    ) -> list[tuple[date, CreditCardItemKind, Decimal]]:
        return [
            (item.transaction_date, item.kind, Decimal(item.amount))
            for item in self.get_statement_items()
        ]

    def get_purchase_categories(self) -> list[tuple[str, Decimal]]:
        return [
            (item.category, Decimal(item.amount))
            for item in self.get_statement_items()
            if item.kind == CreditCardItemKind.PURCHASE
        ]
