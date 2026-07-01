from __future__ import annotations

from datetime import date
from decimal import Decimal

from app.models.domain_entities import TransactionType
from app.repositories.finance_repo import TypeTotals
from app.services.analytics_engine import AnalyticsEngine


class StubFinanceRepository:
    expected_bank_id = 3
    expected_account_id = 7

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
        if bank_id != self.expected_bank_id or account_id != self.expected_account_id:
            return TypeTotals(income=Decimal("0.00"), expenses=Decimal("0.00"))
        if start_date == date(2025, 1, 1) and end_date == date(2026, 6, 30):
            return TypeTotals(income=Decimal("5000.00"), expenses=Decimal("3200.00"))
        if start_date == date(2026, 6, 1) and end_date == date(2026, 6, 30):
            return TypeTotals(income=Decimal("2500.00"), expenses=Decimal("1000.00"))
        if start_date == date(2026, 5, 1) and end_date == date(2026, 5, 31):
            return TypeTotals(income=Decimal("2000.00"), expenses=Decimal("500.00"))
        return TypeTotals(income=Decimal("0.00"), expenses=Decimal("0.00"))

    def get_closing_balance(
        self,
        *,
        cutoff_date: date,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> Decimal:
        if bank_id != self.expected_bank_id or account_id != self.expected_account_id:
            return Decimal("0.00")
        if cutoff_date == date(2026, 6, 30):
            return Decimal("10000.00")
        if cutoff_date == date(2026, 5, 31):
            return Decimal("8000.00")
        return Decimal("0.00")

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
            (date(2026, 6, 1), Decimal("200.00"), Decimal("300.00")),
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


def test_dashboard_metrics_uses_previous_month_baseline_for_variance() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    metrics = engine.get_dashboard_metrics(
        start_date=date(2025, 1, 1),
        end_date=date(2026, 6, 30),
        bank_id=StubFinanceRepository.expected_bank_id,
        account_id=StubFinanceRepository.expected_account_id,
    )

    assert metrics.balance.value == Decimal("10000.00")
    assert metrics.balance.previous_value == Decimal("8000.00")
    assert metrics.balance.change_percent == Decimal("25.00")
    assert metrics.income.value == Decimal("5000.00")
    assert metrics.income.previous_value == Decimal("2000.00")
    assert metrics.income.change_percent == Decimal("25.00")
    assert metrics.expenses.value == Decimal("3200.00")
    assert metrics.expenses.previous_value == Decimal("500.00")
    assert metrics.expenses.change_percent == Decimal("100.00")
    assert metrics.net_savings.value == Decimal("1800.00")
    assert metrics.net_savings.previous_value == Decimal("1500.00")
    assert metrics.net_savings.change_percent == Decimal("0.00")
    assert metrics.savings_percentage.value == Decimal("36.00")
    assert metrics.savings_percentage.previous_value == Decimal("75.00")
    assert metrics.savings_percentage.change_percent == Decimal("-20.00")


def test_cash_flow_emits_expenses_as_negative_values() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    cash_flow = engine.get_cash_flow()

    assert cash_flow[0].income == Decimal("1000.00")
    assert cash_flow[0].expenses == Decimal("-250.00")
    assert cash_flow[0].net_savings == Decimal("750.00")


def test_balance_evolution_reports_monthly_closing_balances() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    points = engine.get_balance_evolution()

    assert [point.balance for point in points] == [
        Decimal("750.00"),
        Decimal("1650.00"),
        Decimal("1550.00"),
    ]


def test_distribution_calculates_percentages() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    distribution = engine.get_distribution(transaction_type=TransactionType.EXPENSE)

    assert distribution[0].category_name == "Groceries"
    assert distribution[0].percentage == Decimal("75.00")
    assert distribution[1].percentage == Decimal("25.00")
