from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.repositories.credit_card_repo import CreditCardRepository
from app.schemas.credit_card import (
    CreditCardCategoryDistributionPoint,
    CreditCardMetrics,
    CreditCardMonthlyActivityPoint,
    CreditCardStatementItemResponse,
    CreditCardStatementUploadResponse,
)
from app.services.credit_card_analytics import CreditCardAnalyticsService
from app.services.credit_card_ingestion import CreditCardIngestionError, CreditCardIngestionService

router = APIRouter(prefix="/api/v1/credit-cards", tags=["credit-cards"])


def get_credit_card_repository(db: Session = Depends(get_db)) -> CreditCardRepository:
    return CreditCardRepository(db)


def get_credit_card_analytics(
    repository: CreditCardRepository = Depends(get_credit_card_repository),
) -> CreditCardAnalyticsService:
    return CreditCardAnalyticsService(repository)


@router.post("/statements/upload", response_model=CreditCardStatementUploadResponse)
async def upload_credit_card_statement(
    file: UploadFile = File(...),
    repository: CreditCardRepository = Depends(get_credit_card_repository),
    settings: Settings = Depends(get_settings),
) -> CreditCardStatementUploadResponse:
    try:
        return await CreditCardIngestionService(repository, settings).ingest_upload(file)
    except CreditCardIngestionError as exc:
        from fastapi import HTTPException

        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.get("/metrics", response_model=CreditCardMetrics)
def get_credit_card_metrics(
    analytics: CreditCardAnalyticsService = Depends(get_credit_card_analytics),
) -> CreditCardMetrics:
    return analytics.get_metrics()


@router.get("/monthly-activity", response_model=list[CreditCardMonthlyActivityPoint])
def get_credit_card_monthly_activity(
    analytics: CreditCardAnalyticsService = Depends(get_credit_card_analytics),
) -> list[CreditCardMonthlyActivityPoint]:
    return analytics.get_monthly_activity()


@router.get("/category-distribution", response_model=list[CreditCardCategoryDistributionPoint])
def get_credit_card_category_distribution(
    analytics: CreditCardAnalyticsService = Depends(get_credit_card_analytics),
) -> list[CreditCardCategoryDistributionPoint]:
    return analytics.get_category_distribution()


@router.get("/statement-items", response_model=list[CreditCardStatementItemResponse])
def get_credit_card_statement_items(
    analytics: CreditCardAnalyticsService = Depends(get_credit_card_analytics),
) -> list[CreditCardStatementItemResponse]:
    return analytics.get_statement_items()
