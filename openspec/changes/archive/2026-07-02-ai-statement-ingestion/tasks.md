## 1. Database Schema

- [x] 1.1 Extend the transaction SQLAlchemy model with `previous_balance`, `balance`, and issuer `bank_id` fields.
- [x] 1.2 Add a `Statement` SQLAlchemy model with bank relationship, unique file hash, filename, and upload timestamp.
- [x] 1.3 Add startup schema synchronization for the new table, new columns, and duplicate-prevention indexes.

## 2. Backend AI Ingestion

- [x] 2.1 Add statement extraction Pydantic schemas with currency defaults and arithmetic validation.
- [x] 2.2 Add repository helpers for statement hash lookup/creation, entity lookup tools, and transaction duplicate checks.
- [x] 2.3 Implement the Pydantic-AI extraction agent with database lookup tools for categories, banks, and accounts.
- [x] 2.4 Implement the ingestion service to validate PDFs, hash files, extract text, run the agent, map entities, skip duplicate transactions, and persist results atomically.
- [x] 2.5 Add the `/api/v1/statements/upload` route and include it in the FastAPI application.
- [x] 2.6 Add AI model/API key settings and document them in `.env.example` and README.

## 3. Frontend Upload UI

- [x] 3.1 Add a frontend API client for statement PDF upload.
- [x] 3.2 Add a single-file PDF upload container in the sidebar above Refresh and Reset.
- [x] 3.3 Show upload success/error status and refresh dashboard data after successful ingestion.

## 4. Verification

- [x] 4.1 Add backend tests for arithmetic validation, duplicate hash rejection, and duplicate transaction skipping.
- [x] 4.2 Add frontend tests for sidebar upload placement and upload status behavior.
- [x] 4.3 Run backend and frontend verification commands and fix failures.
