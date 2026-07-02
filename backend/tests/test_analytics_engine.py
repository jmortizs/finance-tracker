from __future__ import annotations

from datetime import date
from decimal import Decimal
from types import SimpleNamespace

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database import Base
from app.models.domain_entities import SavingsGoal
from app.models.domain_entities import TransactionType
from app.repositories.finance_repo import FinanceRepository, TransactionDateBounds, TypeTotals
from app.schemas.data_transfer import SavingsGoalUpdate
from app.services.analytics_engine import AnalyticsEngine


class StubFinanceRepository:
    expected_bank_id = 3
    expected_account_id = 7
    transaction_date_bounds = TransactionDateBounds(
        min_transaction_date=date(2025, 1, 1),
        max_transaction_date=date(2026, 6, 30),
    )

    def list_banks(self) -> list[object]:
        return []

    def list_accounts(self) -> list[object]:
        return []

    def get_transaction_date_bounds(self) -> TransactionDateBounds:
        return self.transaction_date_bounds

    def get_type_totals(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> TypeTotals:
        if (
            start_date == date(2026, 4, 1)
            and end_date == date(2026, 6, 30)
            and bank_id is None
            and account_id is None
        ):
            return TypeTotals(income=Decimal("2500.00"), expenses=Decimal("900.00"))
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

    def get_savings_goal(self) -> SimpleNamespace:
        return SimpleNamespace(
            id=1,
            target_amount=Decimal("2000.00"),
            start_date=date(2026, 4, 1),
            end_date=date(2026, 6, 30),
        )

    def upsert_savings_goal(
        self, *, target_amount: Decimal, start_date: date, end_date: date
    ) -> SimpleNamespace:
        return SimpleNamespace(
            id=1,
            target_amount=target_amount,
            start_date=start_date,
            end_date=end_date,
        )


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


def test_filter_options_include_transaction_date_bounds() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    options = engine.get_filter_options()

    assert options.min_transaction_date == date(2025, 1, 1)
    assert options.max_transaction_date == date(2026, 6, 30)


def test_filter_options_allow_empty_transaction_date_bounds() -> None:
    repository = StubFinanceRepository()
    repository.transaction_date_bounds = TransactionDateBounds(
        min_transaction_date=None,
        max_transaction_date=None,
    )
    engine = AnalyticsEngine(repository)  # type: ignore[arg-type]

    options = engine.get_filter_options()

    assert options.min_transaction_date is None
    assert options.max_transaction_date is None


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


def test_savings_goal_progress_uses_goal_dates_without_global_filters() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    goal = engine.get_savings_goal()

    assert goal is not None
    assert goal.target_amount == Decimal("2000.00")
    assert goal.progress == Decimal("1600.00")
    assert goal.completion_percentage == Decimal("80.00")
    assert goal.end_date == date(2026, 6, 30)


def test_savings_goal_update_recalculates_progress() -> None:
    engine = AnalyticsEngine(StubFinanceRepository())  # type: ignore[arg-type]

    goal = engine.update_savings_goal(
        SavingsGoalUpdate(
            target_amount=Decimal("3200.00"),
            start_date=date(2026, 4, 1),
            end_date=date(2026, 6, 30),
        )
    )

    assert goal.target_amount == Decimal("3200.00")
    assert goal.progress == Decimal("1600.00")
    assert goal.completion_percentage == Decimal("50.00")


def test_savings_goal_upsert_enforces_single_record_storage() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        session.add_all(
            [
                SavingsGoal(
                    target_amount=Decimal("1000.00"),
                    start_date=date(2026, 1, 1),
                    end_date=date(2026, 3, 31),
                ),
                SavingsGoal(
                    target_amount=Decimal("2000.00"),
                    start_date=date(2026, 4, 1),
                    end_date=date(2026, 6, 30),
                ),
            ]
        )
        session.commit()

        repository = FinanceRepository(session)
        goal = repository.upsert_savings_goal(
            target_amount=Decimal("3000.00"),
            start_date=date(2026, 7, 1),
            end_date=date(2026, 12, 31),
        )
        goals = list(session.scalars(select(SavingsGoal)).all())

    assert goal.target_amount == Decimal("3000.00")
    assert goal.start_date == date(2026, 7, 1)
    assert goal.end_date == date(2026, 12, 31)
    assert len(goals) == 1
