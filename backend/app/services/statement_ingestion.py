from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from io import BytesIO

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from app.config import Settings
from app.models.domain_entities import Category, TransactionType
from app.repositories.finance_repo import FinanceRepository
from app.schemas.statement_ingestion import (
    ExtractedTransaction,
    StatementExtraction,
    StatementUploadResponse,
)
from app.services.statement_agent import StatementAgentDependencies, build_statement_agent


class StatementIngestionError(Exception):
    status_code = 400


class DuplicateStatementError(StatementIngestionError):
    status_code = 409


class StatementConfigurationError(StatementIngestionError):
    status_code = 503


class CorruptedPdfError(StatementIngestionError):
    status_code = 400


class ScannedPdfError(StatementIngestionError):
    status_code = 422


@dataclass
class StatementIngestionService:
    repository: FinanceRepository
    settings: Settings

    async def ingest_upload(self, upload: UploadFile) -> StatementUploadResponse:
        if not self._is_pdf(upload):
            raise StatementIngestionError("Only one PDF bank statement file can be uploaded")

        content = await upload.read()
        if not content:
            raise StatementIngestionError("Uploaded PDF is empty")

        file_hash = hashlib.sha256(content).hexdigest()
        if self.repository.get_statement_by_hash(file_hash) is not None:
            raise DuplicateStatementError("This bank statement PDF has already been processed")

        extraction = await self._extract_statement(content)
        bank = self.repository.get_or_create_bank(
            name=extraction.bank_name, bank_id=extraction.bank_id
        )
        account = self.repository.get_or_create_account(
            bank=bank,
            account_number=extraction.account_number,
            name=extraction.account_name or extraction.account_number,
            currency=extraction.currency or "COP",
            account_id=extraction.account_id,
        )

        inserted_transactions = 0
        skipped_transactions = 0
        statement = self.repository.create_statement(
            bank_id=bank.id,
            file_hash=file_hash,
            file_name=upload.filename or "statement.pdf",
        )

        try:
            for transaction in extraction.transactions:
                if self.repository.transaction_duplicate_exists(
                    account_id=account.id,
                    bank_id=transaction.bank_id,
                    transaction_date=transaction.transaction_date,
                ):
                    skipped_transactions += 1
                    continue

                category = self._resolve_category(transaction)
                self.repository.add_transaction(
                    account_id=account.id,
                    category_id=category.id if category is not None else None,
                    amount=transaction.amount,
                    transaction_date=transaction.transaction_date,
                    description=transaction.description,
                    balance=transaction.balance,
                    bank_id=transaction.bank_id,
                )
                inserted_transactions += 1

            self.repository.db.commit()
        except IntegrityError as exc:
            self.repository.db.rollback()
            raise StatementIngestionError(
                "Statement ingestion failed because of a data conflict"
            ) from exc

        return StatementUploadResponse(
            statement_id=statement.id,
            file_name=statement.file_name,
            file_hash=statement.file_hash,
            bank_id=bank.id,
            account_id=account.id,
            inserted_transactions=inserted_transactions,
            skipped_transactions=skipped_transactions,
        )

    async def _extract_statement(self, content: bytes) -> StatementExtraction:
        if not self.settings.openai_api_key:
            raise StatementConfigurationError("OPENAI_API_KEY is required for statement ingestion")

        text = self._extract_pdf_text(content)

        os.environ.setdefault("OPENAI_API_KEY", self.settings.openai_api_key)
        agent = build_statement_agent(self.settings.statement_ai_model)
        try:
            result = await agent.run(
                self._build_extraction_prompt(text),
                deps=StatementAgentDependencies(repository=self.repository),
            )
        except ValidationError as exc:
            raise StatementIngestionError("Extracted statement data failed validation") from exc

        return result.output

    def _build_extraction_prompt(self, text: str) -> str:
        return (
            "Parse the bank statement below. The text was deterministically extracted from "
            "the PDF with its visual layout preserved: spacing and column alignment mirror "
            "the original document. Map each tabular row to a transaction using the aligned "
            "columns. Use only values present in the text and never invent data that is not "
            "in the payload. Return the validated structured output.\n\n"
            "<statement_text>\n"
            f"{text}\n"
            "</statement_text>"
        )

    def _extract_pdf_text(self, content: bytes) -> str:
        try:
            import pdfplumber
        except ImportError as exc:
            raise StatementConfigurationError(
                "pdfplumber is required to read bank statement PDFs"
            ) from exc

        try:
            with pdfplumber.open(BytesIO(content)) as pdf:
                page_texts = [
                    self._normalize_layout_text(page.extract_text(layout=True) or "")
                    for page in pdf.pages
                ]
        except Exception as exc:
            raise CorruptedPdfError(
                "Uploaded file is corrupted or could not be parsed as a PDF"
            ) from exc

        if not any(page_texts):
            raise ScannedPdfError(
                "The uploaded PDF appears to be a scanned or image-only document; "
                "a text-based bank statement is required"
            )

        return "\n\n".join(
            f"--- PAGE {number} ---\n{page_text}"
            for number, page_text in enumerate(page_texts, start=1)
        )

    @staticmethod
    def _normalize_layout_text(text: str) -> str:
        """Trim trailing whitespace and collapse blank-line runs while keeping indentation."""
        normalized: list[str] = []
        for raw_line in text.splitlines():
            line = raw_line.rstrip()
            if not line and normalized and not normalized[-1]:
                continue
            normalized.append(line)
        return "\n".join(normalized).strip("\n")

    def _resolve_category(self, transaction: ExtractedTransaction) -> Category | None:
        if transaction.category_id is not None:
            category = self.repository.get_category(transaction.category_id)
            if category is not None:
                return category
        if transaction.category_name:
            return self.repository.get_category_by_name_and_type(
                name=transaction.category_name,
                transaction_type=TransactionType(transaction.type),
            )
        return None

    def _is_pdf(self, upload: UploadFile) -> bool:
        filename = (upload.filename or "").lower()
        content_type = (upload.content_type or "").lower()
        return filename.endswith(".pdf") or content_type == "application/pdf"
