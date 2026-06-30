from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

from app.models.domain_entities import TransactionType
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
)

MONEY_QUANT = Decimal("0.01")


class AnalyticsEngine:
    def __init__(self, repository: FinanceRepository) -> None:
        self.repository = repository

    def get_filter_options(self) -> FilterOptionsResponse:
        return FilterOptionsResponse(
            banks=[BankOption.model_validate(bank) for bank in self.repository.list_banks()],
            accounts=[
                AccountOption.model_validate(account) for account in self.repository.list_accounts()
            ],
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
        previous_start, previous_end = self._previous_period(start_date, end_date)
        previous = self.repository.get_type_totals(
            start_date=previous_start, end_date=previous_end, bank_id=bank_id, account_id=account_id
        )

        return DashboardMetrics(
            balance=self._metric(self._balance(current), self._balance(previous)),
            income=self._metric(current.income, previous.income),
            expenses=self._metric(current.expenses, previous.expenses),
            net_savings=self._metric(self._net_savings(current), self._net_savings(previous)),
            savings_percentage=self._metric(
                self._savings_percentage(current), self._savings_percentage(previous)
            ),
        )

    def get_balance_evolution(
        self, *, bank_id: int | None = None, account_id: int | None = None
    ) -> list[BalanceEvolutionPoint]:
        closing_balance = Decimal("0.00")
        points: list[BalanceEvolutionPoint] = []
        for month, income, expenses in self.repository.get_monthly_type_totals(
            bank_id=bank_id, account_id=account_id
        ):
            closing_balance += income - expenses
            points.append(BalanceEvolutionPoint(month=month, balance=self._money(closing_balance)))
        return points

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

    def _previous_period(
        self, start_date: date | None, end_date: date | None
    ) -> tuple[date | None, date | None]:
        if start_date is None or end_date is None:
            return None, None
        period_days = (end_date - start_date).days + 1
        previous_end = start_date - timedelta(days=1)
        previous_start = previous_end - timedelta(days=period_days - 1)
        return previous_start, previous_end

    def _metric(self, value: Decimal, previous: Decimal) -> MetricWithVariation:
        return MetricWithVariation(
            value=self._money(value),
            previous_value=self._money(previous),
            change_percent=self._change_percent(value, previous),
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

    def _balance(self, totals: TypeTotals) -> Decimal:
        return totals.income - totals.expenses

    def _net_savings(self, totals: TypeTotals) -> Decimal:
        return totals.income - totals.expenses

    def _money(self, value: Decimal) -> Decimal:
        return value.quantize(MONEY_QUANT, ROUND_HALF_UP)
