## Context

The backend is a FastAPI application using SQLAlchemy models, repository boundaries, service-layer domain logic, and Pydantic v2 schemas. Database tables are currently created through SQLAlchemy metadata during local startup, with no Alembic migration tree present. The frontend is a Vite React dashboard with a fixed left filter sidebar and existing refresh/reset controls.

The feature adds a cross-cutting ingestion path: a PDF upload API, statement file tracking, transaction persistence updates, an AI extraction agent, and a sidebar upload control. The system remains local and single-user; no authentication, user ownership, token handling, or multi-tenant access control is introduced.

## Goals / Non-Goals

**Goals:**
- Persist statement upload metadata and transaction balance context.
- Reject duplicate PDF uploads by cryptographic file hash before invoking AI extraction.
- Use Pydantic-AI with an OpenAI model configured by environment variables.
- Validate extracted statement totals with `final_balance = initial_balance + total_income - total_expenses` before writing transactions.
- Default transaction currency to `COP` unless the statement explicitly provides another currency.
- Prevent duplicate transaction inserts for the same `account_id`, issuer `bank_id`, and `transaction_date`.
- Add a one-file PDF upload widget above Refresh and Reset in the sidebar.

**Non-Goals:**
- Building a multi-user document library or access control system.
- Persisting raw PDF bytes beyond the immediate ingestion request.
- Guaranteeing perfect OCR for scanned/image-only PDFs beyond available text extraction and model interpretation.
- Replacing existing analytics endpoints or dashboard filter behavior.

## Decisions

1. Use a dedicated `Statement` model and `statements` table.
   - Rationale: file-level de-duplication and upload audit metadata are distinct from transactions.
   - Alternative considered: store `file_hash` on every transaction. Rejected because a single statement can produce many transactions and duplicate upload checks should happen before transaction creation.

2. Extend `Transaction` with nullable `previous_balance`, nullable `balance`, and nullable issuer `bank_id` string.
   - Rationale: existing seeded/manual transactions can remain valid while statement-derived transactions capture balance math and issuer identifiers.
   - Alternative considered: make balances non-null. Rejected because legacy/manual rows may not have statement balance context.

3. Implement ingestion orchestration in a service with repository helpers.
   - Rationale: FastAPI routes stay thin, DB queries remain isolated, and the AI agent can receive dependency-injected lookup tools.
   - Alternative considered: route-level ingestion logic. Rejected because hashing, duplicate checks, AI extraction, validation, mapping, and persistence are cohesive domain workflow steps.

4. Use Pydantic-AI `Agent` with typed dependencies and typed output schema.
   - Rationale: the documented Pydantic-AI pattern supports dependency-injected tools and Pydantic-validated structured output, including model validators that can fail extraction when arithmetic is inconsistent.
   - Alternative considered: direct OpenAI SDK calls. Rejected because the requirement explicitly calls for Pydantic-AI tools and strict output validation.

5. Extract PDF text locally and pass text to the model.
   - Rationale: `pydantic-ai-slim[openai]` is already present; adding `pypdf` keeps PDF parsing local and lightweight.
   - Alternative considered: send PDF bytes directly as document input. Rejected for this implementation because local text extraction is simpler to test and avoids provider-specific document input constraints.

6. Return a compact ingestion summary to the frontend.
   - Rationale: users need immediate feedback about processed, skipped, and inserted transactions without navigating away.
   - Alternative considered: asynchronous background ingestion. Rejected because this local single-user dashboard can process one file at a time synchronously.

## Risks / Trade-offs

- AI extraction can misread ambiguous statement text -> Pydantic schema validation, arithmetic validation, and duplicate checks prevent known-bad writes, but user-visible failures may still require retrying with clearer PDFs.
- Text extraction may fail for scanned PDFs -> the API returns a validation-style error instead of persisting partial data.
- OpenAI credentials may be absent in local environments -> the endpoint fails fast with a clear configuration error, while the rest of the dashboard continues to work.
- Duplicate detection depends on issuer `bank_id` when present -> transactions missing issuer IDs cannot use the full composite key and are inserted only when no exact composite duplicate is found.

## Migration Plan

1. Update SQLAlchemy models so local `create_all` creates the new table and columns for fresh environments.
2. Add an idempotent startup schema sync for the new columns/table because the project does not currently include Alembic migrations.
3. Add a unique constraint/index for `statements.file_hash` and a transaction duplicate index on `account_id`, `bank_id`, and `transaction_date`.
4. Keep new transaction balance fields nullable to avoid breaking existing data.

## Open Questions

None.
