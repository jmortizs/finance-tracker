from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from app.models.domain_entities import SavingsGoal, TransactionType
from app.repositories.finance_repo import FinanceRepository, TypeTotals
from app.schemas.data_transfer import (
    AccountOption,
    BalanceEvolutionPoint,
    BankOption,
    CashFlowPoint,
    DashboardMetrics,
    DistributionPoint,
    FilterOptionsResponse,
    MetricWithVariation,
    SavingsGoalResponse,
    SavingsGoalUpdate,
)

MONEY_QUANT = Decimal("0.01")


class AnalyticsEngine:
    def __init__(self, repository: FinanceRepository) -> None:
        self.repository = repository

    def get_filter_options(self) -> FilterOptionsResponse:
        date_bounds = self.repository.get_transaction_date_bounds()
        return FilterOptionsResponse(
            banks=[BankOption.model_validate(bank) for bank in self.repository.list_banks()],
            accounts=[
                AccountOption.model_validate(account) for account in self.repository.list_accounts()
            ],
            min_transaction_date=date_bounds.min_transaction_date,
            max_transaction_date=date_bounds.max_transaction_date,
        )

    def get_dashboard_metrics(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> DashboardMetrics:
        current = self.repository.get_type_totals(
            start_date=start_date, end_date=end_date, bank_id=bank_id, account_id=account_id
        )
        if end_date is None:
            previous_start, previous_end = self._comparison_period(start_date, end_date)
        else:
            previous_start, previous_end = self._previous_month_period(end_date)
        previous = self.repository.get_type_totals(
            start_date=previous_start, end_date=previous_end, bank_id=bank_id, account_id=account_id
        )
        if end_date is None:
            balance_value = self.repository.get_latest_balance_snapshot(
                start_date=start_date, end_date=end_date, bank_id=bank_id, account_id=account_id
            )
            baseline_balance = self.repository.get_latest_balance_snapshot(
                start_date=previous_start,
                end_date=previous_end,
                bank_id=bank_id,
                account_id=account_id,
            )
            current_variation = current
        else:
            assert previous_end is not None
            current_month_start, current_month_end = self._current_month_period(end_date)
            current_variation = self.repository.get_type_totals(
                start_date=current_month_start,
                end_date=current_month_end,
                bank_id=bank_id,
                account_id=account_id,
            )
            balance_value = self.repository.get_closing_balance(
                cutoff_date=end_date, bank_id=bank_id, account_id=account_id
            )
            baseline_balance = self.repository.get_closing_balance(
                cutoff_date=previous_end, bank_id=bank_id, account_id=account_id
            )

        return DashboardMetrics(
            balance=self._metric(balance_value, baseline_balance),
            income=self._metric(
                current.income, previous.income, change_value=current_variation.income
            ),
            expenses=self._metric(
                current.expenses, previous.expenses, change_value=current_variation.expenses
            ),
            net_savings=self._metric(
                self._net_savings(current),
                self._net_savings(previous),
                change_value=self._net_savings(current_variation),
            ),
            savings_percentage=self._metric(
                self._savings_percentage(current),
                self._savings_percentage(previous),
                change_value=self._savings_percentage(current_variation),
            ),
        )

    def get_balance_evolution(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[BalanceEvolutionPoint]:
        return [
            BalanceEvolutionPoint(month=month, balance=self._money(balance))
            for month, balance in self.repository.get_monthly_balance_snapshots(
                start_date=start_date,
                end_date=end_date,
                bank_id=bank_id,
                account_id=account_id,
            )
        ]

    def get_cash_flow(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[CashFlowPoint]:
        return [
            CashFlowPoint(
                month=month,
                income=self._money(income),
                expenses=self._money(-expenses),
                net_savings=self._money(income - expenses),
            )
            for month, income, expenses in self.repository.get_monthly_type_totals(
                start_date=start_date, end_date=end_date, bank_id=bank_id, account_id=account_id
            )
        ]

    def get_distribution(
        self,
        *,
        transaction_type: TransactionType,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[DistributionPoint]:
        rows = self.repository.get_distribution(
            transaction_type=transaction_type,
            start_date=start_date,
            end_date=end_date,
            bank_id=bank_id,
            account_id=account_id,
        )
        total = sum((amount for _, _, _, amount in rows), Decimal("0.00"))
        return [
            DistributionPoint(
                category_id=category_id,
                category_name=category_name,
                type=row_type,
                amount=self._money(amount),
                percentage=self._percentage(amount, total),
            )
            for category_id, category_name, row_type, amount in rows
        ]

    def get_savings_goal(self) -> SavingsGoalResponse | None:
        goal = self.repository.get_savings_goal()
        if goal is None:
            return None
        return self._savings_goal_response(goal)

    def update_savings_goal(self, payload: SavingsGoalUpdate) -> SavingsGoalResponse:
        goal = self.repository.upsert_savings_goal(
            target_amount=payload.target_amount,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        return self._savings_goal_response(goal)

    def _savings_goal_response(self, goal: SavingsGoal) -> SavingsGoalResponse:
        target_amount = goal.target_amount
        totals = self.repository.get_type_totals(
            start_date=goal.start_date,
            end_date=goal.end_date,
        )
        progress = self._net_savings(totals)
        return SavingsGoalResponse(
            id=goal.id,
            target_amount=self._money(target_amount),
            start_date=goal.start_date,
            end_date=goal.end_date,
            progress=self._money(progress),
            completion_percentage=self._percentage(progress, target_amount),
        )

    def _previous_period(
        self, start_date: date | None, end_date: date | None
    ) -> tuple[date | None, date | None]:
        if start_date is None or end_date is None:
            return None, None
        period_days = (end_date - start_date).days + 1
        previous_end = start_date - timedelta(days=1)
        previous_start = previous_end - timedelta(days=period_days - 1)
        return previous_start, previous_end

    def _comparison_period(
        self, start_date: date | None, end_date: date | None
    ) -> tuple[date | None, date | None]:
        if end_date is None:
            return self._previous_period(start_date, end_date)
        return self._previous_month_period(end_date)

    def _previous_month_period(self, end_date: date) -> tuple[date, date]:
        previous_end = end_date.replace(day=1) - timedelta(days=1)
        previous_start = previous_end.replace(day=1)
        return previous_start, previous_end

    def _current_month_period(self, end_date: date) -> tuple[date, date]:
        return end_date.replace(day=1), end_date

    def _metric(
        self, value: Decimal, previous: Decimal, *, change_value: Decimal | None = None
    ) -> MetricWithVariation:
        comparison_value = value if change_value is None else change_value
        return MetricWithVariation(
            value=self._money(value),
            previous_value=self._money(previous),
            change_percent=self._change_percent(comparison_value, previous),
        )

    def _change_percent(self, value: Decimal, previous: Decimal) -> Decimal | None:
        if previous == 0:
            return None
        return self._percentage(value - previous, abs(previous))

    def _savings_percentage(self, totals: TypeTotals) -> Decimal:
        return self._percentage(self._net_savings(totals), totals.income)

    def _percentage(self, numerator: Decimal, denominator: Decimal) -> Decimal:
        if denominator == 0:
            return Decimal("0.00")
        return ((numerator / denominator) * Decimal("100")).quantize(MONEY_QUANT, ROUND_HALF_UP)

    def _net_savings(self, totals: TypeTotals) -> Decimal:
        return totals.income - totals.expenses

    def _money(self, value: Decimal) -> Decimal:
        return value.quantize(MONEY_QUANT, ROUND_HALF_UP)
