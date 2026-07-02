## Why

Manual transaction entry is error-prone and does not scale for full bank statements. Adding PDF statement ingestion lets the local finance dashboard turn a bank document into validated, categorized transactions while preventing duplicate uploads and duplicate transaction records.

## What Changes

- Add persistence for uploaded statement metadata, including file hash de-duplication.
- Extend transactions with statement balance context and issuer transaction identifiers.
- Add a backend PDF upload endpoint that hashes the file, invokes a Pydantic-AI OpenAI agent, validates extracted arithmetic, maps banks/accounts/categories, and inserts only non-duplicate transactions.
- Add environment configuration for the OpenAI API key and model selection.
- Add a single-PDF upload widget in the left sidebar above the existing Refresh and Reset controls.

## Capabilities

### New Capabilities
- `statement-ingestion`: Covers uploading bank statement PDFs, AI extraction, validation, duplicate prevention, and persistence of statements and extracted transactions.

### Modified Capabilities
- `dashboard-frontend`: Adds the sidebar PDF upload interaction and placement requirement.

## Impact

- Database models and migrations for `transactions` and `statements`.
- Backend API routes, schemas, services, dependencies, and environment settings.
- Pydantic-AI/OpenAI integration and PDF text extraction pipeline.
- Frontend sidebar component and upload API integration.
- README and `.env.example` documentation for AI configuration and statement ingestion.
