from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import NamedTuple

from sqlalchemy import Select, case, delete, func, select
from sqlalchemy.orm import Session

from app.models.domain_entities import Account, Bank, Category, SavingsGoal, Transaction, TransactionType


class TypeTotals(NamedTuple):
    income: Decimal
    expenses: Decimal


class TransactionDateBounds(NamedTuple):
    min_transaction_date: date | None
    max_transaction_date: date | None


class FinanceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_banks(self) -> list[Bank]:
        return list(self.db.scalars(select(Bank).order_by(Bank.name)).all())

    def list_accounts(self) -> list[Account]:
        return list(self.db.scalars(select(Account).order_by(Account.name)).all())

    def get_transaction_date_bounds(self) -> TransactionDateBounds:
        min_date, max_date = self.db.execute(
            select(
                func.min(Transaction.transaction_date),
                func.max(Transaction.transaction_date),
            )
        ).one()
        return TransactionDateBounds(
            min_transaction_date=min_date,
            max_transaction_date=max_date,
        )

    def get_type_totals(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> TypeTotals:
        stmt = self._filtered_transactions(
            start_date, end_date, bank_id, account_id
        ).with_only_columns(
            func.coalesce(
                func.sum(
                    case((Category.type == TransactionType.INCOME, Transaction.amount), else_=0)
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case((Category.type == TransactionType.EXPENSE, Transaction.amount), else_=0)
                ),
                0,
            ),
        )
        income, expenses = self.db.execute(stmt).one()
        return TypeTotals(income=Decimal(income), expenses=Decimal(expenses))

    def get_monthly_type_totals(
        self,
        *,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[tuple[date, Decimal, Decimal]]:
        month = func.date_trunc("month", Transaction.transaction_date).cast(
            Transaction.transaction_date.type
        )
        stmt = (
            self._filtered_transactions(start_date, end_date, bank_id, account_id)
            .with_only_columns(
                month.label("month"),
                func.coalesce(
                    func.sum(
                        case((Category.type == TransactionType.INCOME, Transaction.amount), else_=0)
                    ),
                    0,
                ).label("income"),
                func.coalesce(
                    func.sum(
                        case(
                            (Category.type == TransactionType.EXPENSE, Transaction.amount), else_=0
                        )
                    ),
                    0,
                ).label("expenses"),
            )
            .group_by(month)
            .order_by(month)
        )
        return [
            (row.month, Decimal(row.income), Decimal(row.expenses)) for row in self.db.execute(stmt)
        ]

    def get_closing_balance(
        self,
        *,
        cutoff_date: date,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> Decimal:
        totals = self.get_type_totals(end_date=cutoff_date, bank_id=bank_id, account_id=account_id)
        return totals.income - totals.expenses

    def get_distribution(
        self,
        *,
        transaction_type: TransactionType,
        start_date: date | None = None,
        end_date: date | None = None,
        bank_id: int | None = None,
        account_id: int | None = None,
    ) -> list[tuple[int | None, str, TransactionType, Decimal]]:
        category_name = func.coalesce(Category.name, "Uncategorized")
        stmt = (
            self._filtered_transactions(start_date, end_date, bank_id, account_id)
            .where(Category.type == transaction_type)
            .with_only_columns(
                Category.id,
                category_name.label("category_name"),
                Category.type,
                func.coalesce(func.sum(Transaction.amount), 0).label("amount"),
            )
            .group_by(Category.id, category_name, Category.type)
            .order_by(func.sum(Transaction.amount).desc())
        )
        return [
            (row.id, row.category_name, row.type, Decimal(row.amount))
            for row in self.db.execute(stmt)
        ]

    def get_savings_goal(self) -> SavingsGoal | None:
        return self.db.scalars(select(SavingsGoal).order_by(SavingsGoal.id).limit(1)).first()

    def upsert_savings_goal(
        self, *, target_amount: Decimal, start_date: date, end_date: date
    ) -> SavingsGoal:
        goal = self.get_savings_goal()
        if goal is None:
            goal = SavingsGoal(
                target_amount=target_amount,
                start_date=start_date,
                end_date=end_date,
            )
            self.db.add(goal)
        else:
            goal.target_amount = target_amount
            goal.start_date = start_date
            goal.end_date = end_date

        self.db.flush()
        self.db.execute(delete(SavingsGoal).where(SavingsGoal.id != goal.id))
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def _filtered_transactions(
        self,
        start_date: date | None,
        end_date: date | None,
        bank_id: int | None,
        account_id: int | None,
    ) -> Select[tuple[Transaction]]:
        stmt = select(Transaction).join(Account).outerjoin(Category)
        if start_date is not None:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date is not None:
            stmt = stmt.where(Transaction.transaction_date <= end_date)
        if bank_id is not None:
            stmt = stmt.where(Account.bank_id == bank_id)
        if account_id is not None:
            stmt = stmt.where(Transaction.account_id == account_id)
        return stmt
