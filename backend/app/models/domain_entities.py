from __future__ import annotations

import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class CreditCardItemKind(str, enum.Enum):
    PURCHASE = "purchase"
    PAYMENT = "payment"
    INTEREST = "interest"


class Bank(Base):
    __tablename__ = "banks"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    accounts: Mapped[list[Account]] = relationship(
        back_populates="bank", cascade="all, delete-orphan", passive_deletes=True
    )
    statements: Mapped[list[Statement]] = relationship(
        back_populates="bank", cascade="all, delete-orphan", passive_deletes=True
    )


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    bank_id: Mapped[int] = mapped_column(ForeignKey("banks.id", ondelete="CASCADE"), nullable=False)
    account_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="USD", server_default="USD"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    bank: Mapped[Bank] = relationship(back_populates="accounts")
    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="account", cascade="all, delete-orphan", passive_deletes=True
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transaction_type", native_enum=True), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    transactions: Mapped[list[Transaction]] = relationship(back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        Index("idx_transactions_date", "transaction_date"),
        Index("idx_transactions_account", "account_id"),
        Index("idx_transactions_composite", "account_id", "transaction_date"),
        Index("idx_transactions_bank_duplicate", "account_id", "bank_id", "transaction_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    balance: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    bank_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    account: Mapped[Account] = relationship(back_populates="transactions")
    category: Mapped[Category | None] = relationship(back_populates="transactions")


class Statement(Base):
    __tablename__ = "statements"
    __table_args__ = (UniqueConstraint("file_hash", name="uq_statements_file_hash"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    bank_id: Mapped[int] = mapped_column(ForeignKey("banks.id", ondelete="CASCADE"), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    upload_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    bank: Mapped[Bank] = relationship(back_populates="statements")


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    target_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    issuer: Mapped[str] = mapped_column(String(100), nullable=False)
    account_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="COP")
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    statements: Mapped[list[CreditCardStatement]] = relationship(
        back_populates="credit_card", cascade="all, delete-orphan", passive_deletes=True
    )


class CreditCardStatement(Base):
    __tablename__ = "credit_card_statements"
    __table_args__ = (UniqueConstraint("file_hash", name="uq_credit_card_statements_file_hash"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    credit_card_id: Mapped[int] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="CASCADE"), nullable=False
    )
    file_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    statement_date: Mapped[date] = mapped_column(Date, nullable=False)
    current_balance: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    annual_percentage_rate: Mapped[Decimal | None] = mapped_column(Numeric(7, 4), nullable=True)
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    upload_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    credit_card: Mapped[CreditCard] = relationship(back_populates="statements")
    items: Mapped[list[CreditCardStatementItem]] = relationship(
        back_populates="statement", cascade="all, delete-orphan", passive_deletes=True
    )


class CreditCardStatementItem(Base):
    __tablename__ = "credit_card_statement_items"
    __table_args__ = (
        Index("idx_credit_card_statement_items_date", "transaction_date"),
        Index("idx_credit_card_statement_items_statement", "statement_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    statement_id: Mapped[int] = mapped_column(
        ForeignKey("credit_card_statements.id", ondelete="CASCADE"), nullable=False
    )
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    kind: Mapped[CreditCardItemKind] = mapped_column(
        Enum(CreditCardItemKind, name="credit_card_item_kind", native_enum=True), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    installment_number: Mapped[int | None] = mapped_column(nullable=True)
    installment_total: Mapped[int | None] = mapped_column(nullable=True)
    remaining_amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )

    statement: Mapped[CreditCardStatement] = relationship(back_populates="items")
