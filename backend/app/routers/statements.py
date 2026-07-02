from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.repositories.finance_repo import FinanceRepository
from app.schemas.statement_ingestion import StatementUploadResponse
from app.services.statement_ingestion import StatementIngestionError, StatementIngestionService

router = APIRouter(prefix="/api/v1/statements", tags=["statements"])


def get_statement_ingestion_service(db: Session = Depends(get_db)) -> StatementIngestionService:
    return StatementIngestionService(FinanceRepository(db), get_settings())


@router.post("/upload", response_model=StatementUploadResponse)
async def upload_statement(
    file: UploadFile = File(...),
    service: StatementIngestionService = Depends(get_statement_ingestion_service),
) -> StatementUploadResponse:
    try:
        return await service.ingest_upload(file)
    except StatementIngestionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
