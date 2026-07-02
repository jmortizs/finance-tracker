from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.domain_entities import TransactionType


class ExtractedTransaction(BaseModel):
    transaction_date: date
    description: str | None = None
    amount: Decimal = Field(gt=0, decimal_places=2)
    type: TransactionType
    bank_id: str | None = Field(default=None, description="Issuer transaction identifier")
    category_id: int | None = None
    category_name: str | None = None
    previous_balance: Decimal | None = Field(default=None, decimal_places=2)
    balance: Decimal | None = Field(default=None, decimal_places=2)
    currency: str | None = Field(default=None, min_length=3, max_length=3)

    @model_validator(mode="after")
    def normalize_currency(self) -> "ExtractedTransaction":
        self.currency = (self.currency or "COP").upper()
        return self


class StatementExtraction(BaseModel):
    bank_id: int | None = Field(default=None, description="Existing system bank id when known")
    bank_name: str = Field(min_length=1)
    account_id: int | None = Field(
        default=None, description="Existing system account id when known"
    )
    account_number: str = Field(min_length=1)
    account_name: str | None = None
    currency: str | None = Field(default="COP", min_length=3, max_length=3)
    initial_balance: Decimal = Field(decimal_places=2)
    final_balance: Decimal = Field(decimal_places=2)
    total_income: Decimal = Field(ge=0, decimal_places=2)
    total_expenses: Decimal = Field(ge=0, decimal_places=2)
    transactions: list[ExtractedTransaction] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_statement_math(self) -> "StatementExtraction":
        self.currency = (self.currency or "COP").upper()
        expected = self.initial_balance + self.total_income - self.total_expenses
        if abs(expected - self.final_balance) > Decimal("0.01"):
            raise ValueError(
                "statement balances do not satisfy final_balance = "
                "initial_balance + total_income - total_expenses"
            )

        for transaction in self.transactions:
            transaction.currency = (transaction.currency or self.currency).upper()
        return self


class StatementUploadResponse(BaseModel):
    statement_id: int
    file_name: str
    file_hash: str
    bank_id: int
    account_id: int
    inserted_transactions: int
    skipped_transactions: int

    model_config = ConfigDict(from_attributes=True)
