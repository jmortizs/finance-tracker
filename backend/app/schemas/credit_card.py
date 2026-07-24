from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.domain_entities import CreditCardItemKind

CreditCardCategory = Literal[
    "groceries",
    "dining and delivery",
    "fitness",
    "fuel",
    "clothing",
    "subscriptions",
    "insurance",
    "others",
]


class ExtractedCreditCardItem(BaseModel):
    transaction_date: date
    description: str = Field(min_length=1, max_length=255)
    category: CreditCardCategory
    kind: CreditCardItemKind
    amount: Decimal = Field(decimal_places=2)
    installment_number: int | None = Field(default=None, ge=1)
    installment_total: int | None = Field(default=None, ge=1)
    remaining_amount: Decimal | None = Field(default=None, ge=0, decimal_places=2)

    @model_validator(mode="after")
    def normalize_credit_card_amount(self) -> "ExtractedCreditCardItem":
        if self.installment_number is not None and self.installment_total is None:
            raise ValueError("installment_total is required when installment_number is provided")
        if self.installment_total is not None and self.installment_number is None:
            raise ValueError("installment_number is required when installment_total is provided")
        if (
            self.installment_number is not None
            and self.installment_total is not None
            and self.installment_number > self.installment_total
        ):
            raise ValueError("installment_number cannot exceed installment_total")

        self.amount = (
            -abs(self.amount) if self.kind == CreditCardItemKind.PAYMENT else abs(self.amount)
        )
        if self.remaining_amount is None and self.installment_number is not None:
            assert self.installment_total is not None
            self.remaining_amount = abs(self.amount) * (
                self.installment_total - self.installment_number
            )
        return self


class CreditCardStatementExtraction(BaseModel):
    issuer: str = Field(min_length=1, max_length=100)
    account_number: str = Field(min_length=1, max_length=50)
    card_name: str | None = Field(default=None, max_length=100)
    currency: str = Field(default="COP", min_length=3, max_length=3)
    statement_date: date
    current_balance: Decimal = Field(ge=0, decimal_places=2)
    credit_limit: Decimal = Field(ge=0, decimal_places=2)
    annual_percentage_rate: Decimal | None = Field(default=None, ge=0, decimal_places=4)
    items: list[ExtractedCreditCardItem]


class CreditCardStatementUploadResponse(BaseModel):
    statement_id: int
    credit_card_id: int
    file_name: str
    file_hash: str
    inserted_items: int


class CreditCardMetrics(BaseModel):
    current_statement_balance: Decimal = Field(decimal_places=2)
    credit_utilization: Decimal = Field(decimal_places=2)
    available_credit: Decimal = Field(decimal_places=2)
    weighted_apr: Decimal = Field(decimal_places=4)
    active_plans: int


class CreditCardMonthlyActivityPoint(BaseModel):
    month: date
    spending: Decimal = Field(decimal_places=2)
    payments: Decimal = Field(decimal_places=2)
    interest: Decimal = Field(decimal_places=2)


class CreditCardCategoryDistributionPoint(BaseModel):
    category: CreditCardCategory
    amount: Decimal = Field(decimal_places=2)
    percentage: Decimal = Field(decimal_places=2)


class CreditCardStatementItemResponse(BaseModel):
    id: int
    transaction_date: date
    description: str
    category: CreditCardCategory
    kind: CreditCardItemKind
    amount: Decimal = Field(decimal_places=2)
    installment_number: int | None
    installment_total: int | None
    remaining_amount: Decimal | None = Field(decimal_places=2)

    model_config = ConfigDict(from_attributes=True)
