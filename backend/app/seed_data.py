from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.domain_entities import (
    Account,
    Bank,
    Category,
    SavingsGoal,
    Transaction,
    TransactionType,
)

MOCK_TRANSACTION_PREFIX = "Mock data:"


@dataclass(frozen=True)
class MockTransaction:
    account_number: str
    category_name: str
    amount: Decimal
    transaction_date: date
    description: str


BANKS = ("Blue Ridge Bank", "Metro Credit Union")

ACCOUNTS = (
    {
        "bank_name": "Blue Ridge Bank",
        "account_number": "BRB-CHECKING-001",
        "name": "Everyday Checking",
        "currency": "USD",
    },
    {
        "bank_name": "Blue Ridge Bank",
        "account_number": "BRB-SAVINGS-001",
        "name": "Emergency Savings",
        "currency": "USD",
    },
    {
        "bank_name": "Metro Credit Union",
        "account_number": "MCU-CREDIT-001",
        "name": "Rewards Card",
        "currency": "USD",
    },
)

CATEGORIES = (
    ("Salary", TransactionType.INCOME),
    ("Freelance", TransactionType.INCOME),
    ("Interest", TransactionType.INCOME),
    ("Housing", TransactionType.EXPENSE),
    ("Groceries", TransactionType.EXPENSE),
    ("Utilities", TransactionType.EXPENSE),
    ("Transport", TransactionType.EXPENSE),
    ("Dining", TransactionType.EXPENSE),
    ("Healthcare", TransactionType.EXPENSE),
    ("Entertainment", TransactionType.EXPENSE),
    ("Travel", TransactionType.EXPENSE),
)

TRANSACTIONS = (
    MockTransaction(
        "BRB-CHECKING-001",
        "Salary",
        Decimal("5200.00"),
        date(2026, 3, 1),
        "March payroll",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Housing",
        Decimal("1750.00"),
        date(2026, 3, 3),
        "March rent",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Groceries",
        Decimal("640.35"),
        date(2026, 3, 9),
        "March groceries",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Dining",
        Decimal("214.80"),
        date(2026, 3, 17),
        "March restaurants",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Utilities",
        Decimal("318.44"),
        date(2026, 3, 21),
        "March utilities",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Salary",
        Decimal("5200.00"),
        date(2026, 4, 1),
        "April payroll",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Freelance",
        Decimal("950.00"),
        date(2026, 4, 8),
        "April client invoice",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Housing",
        Decimal("1750.00"),
        date(2026, 4, 3),
        "April rent",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Groceries",
        Decimal("712.18"),
        date(2026, 4, 10),
        "April groceries",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Transport",
        Decimal("186.90"),
        date(2026, 4, 16),
        "April transit",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Entertainment",
        Decimal("142.50"),
        date(2026, 4, 22),
        "April entertainment",
    ),
    MockTransaction(
        "BRB-SAVINGS-001",
        "Interest",
        Decimal("22.15"),
        date(2026, 4, 30),
        "April savings interest",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Salary",
        Decimal("5350.00"),
        date(2026, 5, 1),
        "May payroll",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Housing",
        Decimal("1750.00"),
        date(2026, 5, 3),
        "May rent",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Groceries",
        Decimal("689.62"),
        date(2026, 5, 12),
        "May groceries",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Healthcare",
        Decimal("220.00"),
        date(2026, 5, 14),
        "May pharmacy",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Dining",
        Decimal("298.15"),
        date(2026, 5, 19),
        "May restaurants",
    ),
    MockTransaction(
        "BRB-SAVINGS-001",
        "Interest",
        Decimal("25.73"),
        date(2026, 5, 31),
        "May savings interest",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Salary",
        Decimal("5350.00"),
        date(2026, 6, 1),
        "June payroll",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Freelance",
        Decimal("1200.00"),
        date(2026, 6, 7),
        "June client invoice",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Housing",
        Decimal("1750.00"),
        date(2026, 6, 3),
        "June rent",
    ),
    MockTransaction(
        "BRB-CHECKING-001",
        "Groceries",
        Decimal("735.28"),
        date(2026, 6, 11),
        "June groceries",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Travel",
        Decimal("840.00"),
        date(2026, 6, 18),
        "June weekend trip",
    ),
    MockTransaction(
        "MCU-CREDIT-001",
        "Utilities",
        Decimal("331.72"),
        date(2026, 6, 24),
        "June utilities",
    ),
    MockTransaction(
        "BRB-SAVINGS-001",
        "Interest",
        Decimal("27.92"),
        date(2026, 6, 30),
        "June savings interest",
    ),
)

SAVINGS_GOALS = (
    {
        "name": "Emergency Fund",
        "target_amount": Decimal("15000.00"),
        "current_amount": Decimal("9250.00"),
        "target_date": date(2026, 12, 31),
    },
    {
        "name": "Vacation",
        "target_amount": Decimal("4000.00"),
        "current_amount": Decimal("1800.00"),
        "target_date": date(2026, 9, 15),
    },
)


def seed_mock_data(db: Session) -> bool:
    """Populate deterministic local data once. Returns True when rows are inserted."""
    banks = _upsert_banks(db)
    accounts = _upsert_accounts(db, banks)
    categories = _upsert_categories(db)
    _upsert_savings_goals(db)

    if _mock_transactions_exist(db):
        db.commit()
        return False

    for transaction in TRANSACTIONS:
        db.add(
            Transaction(
                account_id=accounts[transaction.account_number].id,
                category_id=categories[transaction.category_name].id,
                amount=transaction.amount,
                transaction_date=transaction.transaction_date,
                description=f"{MOCK_TRANSACTION_PREFIX} {transaction.description}",
            )
        )

    db.commit()
    return True


def _upsert_banks(db: Session) -> dict[str, Bank]:
    existing = {bank.name: bank for bank in db.scalars(select(Bank)).all()}
    for bank_name in BANKS:
        if bank_name not in existing:
            bank = Bank(name=bank_name)
            db.add(bank)
            existing[bank_name] = bank
    db.flush()
    return existing


def _upsert_accounts(db: Session, banks: dict[str, Bank]) -> dict[str, Account]:
    existing = {account.account_number: account for account in db.scalars(select(Account)).all()}
    for account_data in ACCOUNTS:
        account_number = account_data["account_number"]
        if account_number not in existing:
            account = Account(
                bank_id=banks[account_data["bank_name"]].id,
                account_number=account_number,
                name=account_data["name"],
                currency=account_data["currency"],
            )
            db.add(account)
            existing[account_number] = account
    db.flush()
    return existing


def _upsert_categories(db: Session) -> dict[str, Category]:
    existing = {category.name: category for category in db.scalars(select(Category)).all()}
    for category_name, transaction_type in CATEGORIES:
        if category_name not in existing:
            category = Category(name=category_name, type=transaction_type)
            db.add(category)
            existing[category_name] = category
    db.flush()
    return existing


def _upsert_savings_goals(db: Session) -> None:
    existing = {goal.name: goal for goal in db.scalars(select(SavingsGoal)).all()}
    for goal_data in SAVINGS_GOALS:
        if goal_data["name"] not in existing:
            db.add(SavingsGoal(**goal_data))
    db.flush()


def _mock_transactions_exist(db: Session) -> bool:
    return (
        db.scalar(
            select(func.count(Transaction.id)).where(
                Transaction.description.startswith(MOCK_TRANSACTION_PREFIX)
            )
        )
        or 0
    ) > 0
