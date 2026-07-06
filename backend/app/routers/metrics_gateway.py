from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.domain_entities import TransactionType
from app.repositories.finance_repo import FinanceRepository
from app.schemas.data_transfer import (
    BalanceEvolutionPoint,
    CashFlowPoint,
    DashboardMetrics,
    DistributionPoint,
    FilterOptionsResponse,
    SavingsGoalResponse,
    SavingsGoalUpdate,
)
from app.services.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


def get_analytics_engine(db: Session = Depends(get_db)) -> AnalyticsEngine:
    return AnalyticsEngine(FinanceRepository(db))


@router.get("/filters/options", response_model=FilterOptionsResponse)
def get_filter_options(
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> FilterOptionsResponse:
    return engine.get_filter_options()


@router.get("/dashboard/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(
    start_date: date | None = None,
    end_date: date | None = None,
    bank_id: int | None = Query(default=None, gt=0),
    account_id: int | None = Query(default=None, gt=0),
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> DashboardMetrics:
    return engine.get_dashboard_metrics(
        start_date=start_date, end_date=end_date, bank_id=bank_id, account_id=account_id
    )


@router.get("/dashboard/charts/balance-evolution", response_model=list[BalanceEvolutionPoint])
def get_balance_evolution(
    start_date: date | None = None,
    end_date: date | None = None,
    bank_id: int | None = Query(default=None, gt=0),
    account_id: int | None = Query(default=None, gt=0),
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> list[BalanceEvolutionPoint]:
    return engine.get_balance_evolution(
        start_date=start_date, end_date=end_date, bank_id=bank_id, account_id=account_id
    )


@router.get("/dashboard/charts/cash-flow", response_model=list[CashFlowPoint])
def get_cash_flow(
    start_date: date | None = None,
    end_date: date | None = None,
    bank_id: int | None = Query(default=None, gt=0),
    account_id: int | None = Query(default=None, gt=0),
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> list[CashFlowPoint]:
    return engine.get_cash_flow(
        start_date=start_date, end_date=end_date, bank_id=bank_id, account_id=account_id
    )


@router.get("/dashboard/charts/distribution", response_model=list[DistributionPoint])
def get_distribution(
    type: TransactionType = Query(...),  # noqa: A002
    start_date: date | None = None,
    end_date: date | None = None,
    bank_id: int | None = Query(default=None, gt=0),
    account_id: int | None = Query(default=None, gt=0),
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> list[DistributionPoint]:
    return engine.get_distribution(
        transaction_type=type,
        start_date=start_date,
        end_date=end_date,
        bank_id=bank_id,
        account_id=account_id,
    )


@router.get("/savings-goal", response_model=SavingsGoalResponse | None)
def get_savings_goal(
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> SavingsGoalResponse | None:
    return engine.get_savings_goal()


@router.put("/savings-goal", response_model=SavingsGoalResponse)
def update_savings_goal(
    payload: SavingsGoalUpdate,
    engine: AnalyticsEngine = Depends(get_analytics_engine),
) -> SavingsGoalResponse:
    return engine.update_savings_goal(payload)
