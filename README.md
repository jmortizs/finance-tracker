# Personal Finance Dashboard

## AI Development Motivation

This project is an intentional playground for AI-assisted development. A core
motivation is to understand, in a practical end-to-end codebase, how tools
like Codex, Cursor, and OpenCode can be used effectively with a
Spec-Driven Development (SDD) framework such as OpenSpec.

The configured agentic workflow follows this lifecycle:

1. Explore and clarify the problem space before implementation.
2. Create proposal artifacts (`proposal.md`, `design.md`, `tasks.md`) with
   OpenSpec.
3. Implement tasks incrementally from the generated task list.
4. Verify implementation completeness, correctness, and coherence against the
   planned artifacts.
5. Archive/sync finalized change artifacts and ship through normal git and PR
   flow.

For full automation, the `autonomous-sdd` skill orchestrates this end-to-end
pipeline from exploration to Pull Request creation.

This workflow is grounded in the constraints documented in `AGENTS.md`:
single-user scope, local Docker execution, and no multi-tenant auth/session
complexity.

Localized single-user finance dashboard for Docker-based local deployments.

## Services

- PostgreSQL 18.4 on `localhost:5432`
- FastAPI backend on `localhost:8000`
- Vite React frontend on `localhost:5173`

## Run

```bash
docker compose up --build
```

The API documentation is available at `http://localhost:8000/docs`.
The dashboard frontend is available at `http://localhost:5173`.
On startup the backend creates the PostgreSQL schema from `backend/specs.md`, seeds
seven default categories (`income`, `expenses`, `salary`, `interest`,
`credit card payment`, `insurance`, `cash withdrawal`), and loads deterministic
mock data for local API testing when enabled. To start without mock transactions,
set `SEED_MOCK_DATA=false` for the backend service; default categories are still
seeded on every startup.

The frontend uses a Vite development proxy for relative `/api/v1` requests. In Docker,
that proxy targets the backend service at `http://backend:8000`; when running the
frontend directly on the host, it defaults to `http://localhost:8000`.

To initialize or reseed manually against the configured database:

```bash
cd backend
uv run python -m app.database
```

## API

All dashboard endpoints are mounted under `/api/v1`:

- `GET /api/v1/filters/options`
- `GET /api/v1/dashboard/metrics`
- `GET /api/v1/dashboard/charts/balance-evolution`
- `GET /api/v1/dashboard/charts/cash-flow`
- `GET /api/v1/dashboard/charts/distribution`
- `GET /api/v1/savings-goal`
- `PUT /api/v1/savings-goal`
- `POST /api/v1/statements/upload`
- `POST /api/v1/credit-cards/statements/upload`
- `GET /api/v1/credit-cards/metrics`
- `GET /api/v1/credit-cards/monthly-activity`
- `GET /api/v1/credit-cards/category-distribution`
- `GET /api/v1/credit-cards/statement-items`

`GET /api/v1/filters/options` returns banks, accounts, and nullable
`min_transaction_date` / `max_transaction_date` bounds for dashboard date defaults.
Optional dashboard filters use `start_date`, `end_date`, `bank_id`, and `account_id` where supported by the endpoint.
The savings goal endpoint is filter-isolated: progress is calculated from income minus expenses within the goal's own `start_date` and `end_date`.
The main dashboard includes an inline-editable savings goal card for `target_amount`, `start_date`, and `end_date`.
Bank statement ingestion accepts one PDF at `/api/v1/statements/upload`, rejects duplicate files by SHA-256 hash, extracts layout-preserved text deterministically with `pdfplumber` before parsing it with Pydantic-AI/OpenAI, validates statement arithmetic, defaults currency to `COP` unless specified, and skips duplicate issuer transactions by `account_id`, `bank_id`, and `transaction_date`.
Corrupted or unparseable PDFs are rejected with HTTP 400, and image-only (scanned) PDFs with no extractable text are rejected with HTTP 422 before any AI call.

Credit-card statement ingestion is independent from bank statements and cash dashboard
analytics. It first extracts layout-preserved embedded text and runs local Tesseract OCR
only for PDF pages without text, then uses the configured OpenAI model to return strict
card metadata and statement items. The Credit Cards page is available from the dashboard
sidebar and shows card-balance metrics, monthly activity, purchase categories, and
installment details. The backend Docker image installs Tesseract automatically; host
execution of scanned statement ingestion requires the `tesseract` executable on `PATH`.

## AI Statement Ingestion Configuration

Copy `.env.example` to `.env` for local overrides. Statement ingestion uploads one
text-based PDF bank statement to `POST /api/v1/statements/upload` and converts it
into local dashboard data.

The ingestion flow is:

1. The API accepts a single PDF file and rejects empty or non-PDF uploads.
2. The backend computes a SHA-256 hash for the file and rejects exact statement
   re-uploads with HTTP 409 before doing any extraction work.
3. `pdfplumber` extracts layout-preserved text from the PDF. Column spacing and
   page boundaries are kept so the AI parser can map statement rows to dates,
   descriptions, amounts, and balances. Corrupted PDFs return HTTP 400, and
   scanned or image-only PDFs with no extractable text return HTTP 422.
4. A Pydantic-AI agent sends the extracted text to OpenAI and asks for structured
   statement data only. The agent can read existing local banks, accounts, and
   categories to map the statement to known records.
5. Pydantic validates the AI output: expenses and income use positive amounts,
   transactions are classified as `INCOME` or `EXPENSE`, currency defaults to
   `COP`, and statement arithmetic must satisfy
   `final_balance = initial_balance + total_income - total_expenses`.
6. The service creates or reuses the bank and account, records the uploaded
   statement, resolves transaction categories by id or name/type, and inserts only
   transactions that are not already present for the same account, issuer
   transaction id, and transaction date.

The upload response returns the stored statement id, file hash, bank/account ids,
and counts for inserted and skipped transactions.

Statement ingestion requires:

- `OPENAI_API_KEY`: OpenAI API key used by Pydantic-AI.
- `STATEMENT_AI_MODEL`: OpenAI model for statement extraction, defaulting to `gpt-5.4-mini`.


## Local Backend Checks

From `backend/`:

```bash
uv run ruff check app
uv run ruff format app
uv run mypy app
uv run pytest
```

## Local Frontend Checks

From `frontend/`:

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```
