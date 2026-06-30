from __future__ import annotations

from datetime import date
from decimal import Decimal

from app.models.domain_entities import TransactionType
from app.repositories.finance_repo import TypeTotals
from app.services.analytics_engine import AnalyticsEngine


class StubFinanceRepository:
    def list_banks(self) -> list[object]:
        return []

    def list_accounts(self) -> list[object]:
        return []

    def get_type_totals(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> TypeTotals:
        if start_date == date(2026, 5, 1) and end_date == date(2026, 5, 31):
            return TypeTotals(income=Decimal("2000.00"), expenses=Decimal("700.00"))
        if start_date == date(2026, 3, 31) and end_date == date(2026, 4, 30):
            return TypeTotals(income=Decimal("1500.00"), expenses=Decimal("500.00"))
        return TypeTotals(income=Decimal("0.00"), expenses=Decimal("0.00"))

    def get_monthly_type_totals(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[tuple[date, Decimal, Decimal]]:
        return [
            (date(2026, 4, 1), Decimal("1000.00"), Decimal("250.00")),
            (date(2026, 5, 1), Decimal("1200.00"), Decimal("300.00")),
        ]

    def get_distribution(
        self,
        *,
        transaction_type: TransactionType,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[tuple[int | None, str, TransactionType, Decimal]]:
        return [
            (1, "Groceries", transaction_type, Decimal("75.00")),
            (2, "Transport", transaction_type, Decimal("25.00")),
        ]


def test_dashboard_metrics_calculates_current_and_previous_periods() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    metrics = engine.get_dashboard_metrics(
        start_date=date(2026, 5, 1),
        end_date=date(2026, 5, 31),
    )

    assert metrics.balance.value == Decimal("1300.00")
    assert metrics.balance.previous_value == Decimal("1000.00")
    assert metrics.balance.change_percent == Decimal("30.00")
    assert metrics.income.change_percent == Decimal("33.33")
    assert metrics.expenses.change_percent == Decimal("40.00")
    assert metrics.savings_percentage.value == Decimal("65.00")


def test_cash_flow_emits_expenses_as_negative_values() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    cash_flow = engine.get_cash_flow()

    assert cash_flow[0].income == Decimal("1000.00")
    assert cash_flow[0].expenses == Decimal("-250.00")
    assert cash_flow[0].net_savings == Decimal("750.00")


def test_balance_evolution_accumulates_monthly_net_savings() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    points = engine.get_balance_evolution()

    assert [point.balance for point in points] == [Decimal("750.00"), Decimal("1650.00")]


def test_distribution_calculates_percentages() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    distribution = engine.get_distribution(transaction_type=TransactionType.EXPENSE)

    assert distribution[0].category_name == "Groceries"
    assert distribution[0].percentage == Decimal("75.00")
    assert distribution[1].percentage == Decimal("25.00")
