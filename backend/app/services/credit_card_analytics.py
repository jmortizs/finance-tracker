from __future__ import annotations

from collections import defaultdict
from datetime import date
from decimal import Decimal

from app.models.domain_entities import CreditCardItemKind
from app.repositories.credit_card_repo import CreditCardRepository
from app.schemas.credit_card import (
    CreditCardCategoryDistributionPoint,
    CreditCardMetrics,
    CreditCardMonthlyActivityPoint,
    CreditCardStatementItemResponse,
)


class CreditCardAnalyticsService:
    def __init__(self, repository: CreditCardRepository) -> None:
        self.repository = repository

    def get_metrics(self) -> CreditCardMetrics:
        latest_statements = self.repository.get_latest_statements()
        balance = sum((statement.current_balance for statement in latest_statements), Decimal("0"))
        limit = sum((statement.credit_limit for statement in latest_statements), Decimal("0"))
        weighted_apr_numerator = sum(
            (
                statement.current_balance * (statement.annual_percentage_rate or Decimal("0"))
                for statement in latest_statements
                if statement.current_balance > 0
            ),
            Decimal("0"),
        )
        active_plans = sum(
            1
            for item in self.repository.get_statement_items()
            if item.installment_number is not None
            and item.installment_total is not None
            and item.installment_number < item.installment_total
        )
        return CreditCardMetrics(
            current_statement_balance=balance,
            credit_utilization=(balance / limit * 100) if limit else Decimal("0"),
            available_credit=limit - balance,
            weighted_apr=(weighted_apr_numerator / balance) if balance else Decimal("0"),
            active_plans=active_plans,
        )

    def get_monthly_activity(self) -> list[CreditCardMonthlyActivityPoint]:
        totals: dict[date, dict[CreditCardItemKind, Decimal]] = defaultdict(
            lambda: defaultdict(Decimal)
        )
        for transaction_date, kind, amount in self.repository.get_monthly_items():
            totals[transaction_date.replace(day=1)][kind] += amount
        return [
            CreditCardMonthlyActivityPoint(
                month=month,
                spending=values[CreditCardItemKind.PURCHASE],
                payments=values[CreditCardItemKind.PAYMENT],
                interest=values[CreditCardItemKind.INTEREST],
            )
            for month, values in sorted(totals.items())
        ]

    def get_category_distribution(self) -> list[CreditCardCategoryDistributionPoint]:
        totals: dict[str, Decimal] = defaultdict(Decimal)
        for category, amount in self.repository.get_purchase_categories():
            totals[category] += amount
        total = sum(totals.values(), Decimal("0"))
        return [
            CreditCardCategoryDistributionPoint(
                category=category,  # type: ignore[arg-type]
                amount=amount,
                percentage=(amount / total * 100) if total else Decimal("0"),
            )
            for category, amount in sorted(totals.items(), key=lambda item: item[1], reverse=True)
        ]

    def get_statement_items(self) -> list[CreditCardStatementItemResponse]:
        return [
            CreditCardStatementItemResponse.model_validate(item)
            for item in self.repository.get_statement_items()
        ]
