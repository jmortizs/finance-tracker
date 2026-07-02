from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.domain_entities import TransactionType


class BankOption(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class AccountOption(BaseModel):
    id: int
    bank_id: int
    name: str
    account_number: str
    currency: str

    model_config = ConfigDict(from_attributes=True)


class FilterOptionsResponse(BaseModel):
    banks: list[BankOption]
    accounts: list[AccountOption]
    min_transaction_date: date | None
    max_transaction_date: date | None


class MetricWithVariation(BaseModel):
    value: Decimal = Field(decimal_places=2)
    previous_value: Decimal = Field(decimal_places=2)
    change_percent: Decimal | None = Field(default=None, decimal_places=2)


class DashboardMetrics(BaseModel):
    balance: MetricWithVariation
    income: MetricWithVariation
    expenses: MetricWithVariation
    net_savings: MetricWithVariation
    savings_percentage: MetricWithVariation


class BalanceEvolutionPoint(BaseModel):
    month: date
    balance: Decimal = Field(
        decimal_places=2, description="Final closing balance after activity in this month."
    )


class CashFlowPoint(BaseModel):
    month: date
    income: Decimal = Field(decimal_places=2)
    expenses: Decimal = Field(
        decimal_places=2, description="Expenses are emitted as negative values."
    )
    net_savings: Decimal = Field(decimal_places=2)


class DistributionPoint(BaseModel):
    category_id: int | None
    category_name: str
    type: TransactionType
    amount: Decimal = Field(decimal_places=2)
    percentage: Decimal = Field(decimal_places=2)


class SavingsGoalUpdate(BaseModel):
    target_amount: Decimal = Field(ge=0, decimal_places=2)
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_date_range(self) -> "SavingsGoalUpdate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class SavingsGoalResponse(BaseModel):
    id: int
    target_amount: Decimal = Field(decimal_places=2)
    start_date: date
    end_date: date
    progress: Decimal = Field(decimal_places=2)
    completion_percentage: Decimal = Field(decimal_places=2)

    model_config = ConfigDict(from_attributes=True)
