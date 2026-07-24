from __future__ import annotations

import hashlib
import os
import subprocess
from dataclasses import dataclass
from io import BytesIO
from typing import Any

from fastapi import UploadFile
from pydantic import ValidationError

from app.config import Settings
from app.repositories.credit_card_repo import CreditCardRepository
from app.schemas.credit_card import CreditCardStatementExtraction, CreditCardStatementUploadResponse
from app.services.credit_card_agent import build_credit_card_agent


class CreditCardIngestionError(Exception):
    status_code = 400


class DuplicateCreditCardStatementError(CreditCardIngestionError):
    status_code = 409


class CreditCardConfigurationError(CreditCardIngestionError):
    status_code = 503


class UnreadableCreditCardPdfError(CreditCardIngestionError):
    status_code = 422


@dataclass
class CreditCardIngestionService:
    repository: CreditCardRepository
    settings: Settings

    async def ingest_upload(self, upload: UploadFile) -> CreditCardStatementUploadResponse:
        if not self._is_pdf(upload):
            raise CreditCardIngestionError("Only one PDF credit-card statement can be uploaded")
        content = await upload.read()
        if not content:
            raise CreditCardIngestionError("Uploaded PDF is empty")
        file_hash = hashlib.sha256(content).hexdigest()
        if self.repository.get_statement_by_hash(file_hash) is not None:
            raise DuplicateCreditCardStatementError(
                "This credit-card statement PDF has already been processed"
            )

        extraction = await self._extract_statement(content)
        card = self.repository.get_or_create_card(extraction)
        statement = self.repository.create_statement(
            credit_card_id=card.id,
            file_hash=file_hash,
            file_name=upload.filename or "credit-card-statement.pdf",
            extraction=extraction,
        )
        items = self.repository.create_items(statement_id=statement.id, extraction=extraction)
        self.repository.db.commit()
        return CreditCardStatementUploadResponse(
            statement_id=statement.id,
            credit_card_id=card.id,
            file_name=statement.file_name,
            file_hash=statement.file_hash,
            inserted_items=len(items),
        )

    async def _extract_statement(self, content: bytes) -> CreditCardStatementExtraction:
        if not self.settings.openai_api_key:
            raise CreditCardConfigurationError(
                "OPENAI_API_KEY is required for credit-card ingestion"
            )
        os.environ.setdefault("OPENAI_API_KEY", self.settings.openai_api_key)
        try:
            result = await build_credit_card_agent(self.settings.statement_ai_model).run(
                self._build_extraction_prompt(self._extract_pdf_text(content))
            )
        except ValidationError as exc:
            raise CreditCardIngestionError("Extracted credit-card data failed validation") from exc
        return result.output

    def _extract_pdf_text(self, content: bytes) -> str:
        try:
            import pdfplumber

            with pdfplumber.open(BytesIO(content)) as pdf:
                page_texts = []
                for page_number, page in enumerate(pdf.pages, start=1):
                    text = self._normalize_text(page.extract_text(layout=True) or "")
                    source = "TEXT"
                    if not text:
                        text = self._normalize_text(self._ocr_page(page))
                        source = "OCR"
                    page_texts.append(f"--- PAGE {page_number} ({source}) ---\n{text}")
        except UnreadableCreditCardPdfError:
            raise
        except Exception as exc:
            raise CreditCardIngestionError(
                "Uploaded file is corrupted or could not be parsed as a PDF"
            ) from exc
        if not any(text.rsplit("\n", 1)[-1].strip() for text in page_texts):
            raise UnreadableCreditCardPdfError(
                "The credit-card statement has no readable embedded text or OCR output"
            )
        return "\n\n".join(page_texts)

    def _ocr_page(self, page: Any) -> str:
        image = page.to_image(resolution=200).original
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        try:
            result = subprocess.run(
                ["tesseract", "stdin", "stdout", "--psm", "6"],
                input=buffer.getvalue(),
                capture_output=True,
                check=True,
            )
        except FileNotFoundError as exc:
            raise CreditCardConfigurationError(
                "Local Tesseract OCR is required for scanned PDFs"
            ) from exc
        except subprocess.CalledProcessError as exc:
            raise UnreadableCreditCardPdfError("Local OCR could not read a statement page") from exc
        return result.stdout.decode(errors="replace")

    @staticmethod
    def _normalize_text(text: str) -> str:
        return "\n".join(line.rstrip() for line in text.splitlines()).strip()

    @staticmethod
    def _build_extraction_prompt(text: str) -> str:
        return (
            "Parse the credit-card statement below. Text pages preserve PDF layout and OCR pages are "
            "marked. Extract only documented values. Categorize every item as exactly one of: "
            "groceries, dining and delivery, fitness, fuel, clothing, subscriptions, insurance, "
            "or others. Classify each item as purchase, payment, or interest.\n\n"
            f"<credit_card_statement>\n{text}\n</credit_card_statement>"
        )

    @staticmethod
    def _is_pdf(upload: UploadFile) -> bool:
        return (upload.filename or "").lower().endswith(".pdf") or (
            upload.content_type or ""
        ).lower() == "application/pdf"
