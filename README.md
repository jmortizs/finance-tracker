# Personal Finance Dashboard

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

`GET /api/v1/filters/options` returns banks, accounts, and nullable
`min_transaction_date` / `max_transaction_date` bounds for dashboard date defaults.
Optional dashboard filters use `start_date`, `end_date`, `bank_id`, and `account_id` where supported by the endpoint.
The savings goal endpoint is filter-isolated: progress is calculated from income minus expenses within the goal's own `start_date` and `end_date`.
The main dashboard includes an inline-editable savings goal card for `target_amount`, `start_date`, and `end_date`.
Bank statement ingestion accepts one PDF at `/api/v1/statements/upload`, rejects duplicate files by SHA-256 hash, extracts layout-preserved text deterministically with `pdfplumber` before parsing it with Pydantic-AI/OpenAI, validates statement arithmetic, defaults currency to `COP` unless specified, and skips duplicate issuer transactions by `account_id`, `bank_id`, and `transaction_date`.
Corrupted or unparseable PDFs are rejected with HTTP 400, and image-only (scanned) PDFs with no extractable text are rejected with HTTP 422 before any AI call.

## AI Statement Ingestion Configuration

Copy `.env.example` to `.env` for local overrides. Statement ingestion requires:

- `OPENAI_API_KEY`: OpenAI API key used by Pydantic-AI.
- `STATEMENT_AI_MODEL`: OpenAI model for statement extraction, defaulting to `gpt-5.4-mini`.

Example seeded API calls:

```bash
curl "http://localhost:8000/api/v1/filters/options"
curl "http://localhost:8000/api/v1/dashboard/metrics?start_date=2026-06-01&end_date=2026-06-30"
curl "http://localhost:8000/api/v1/dashboard/charts/distribution?type=EXPENSE&start_date=2026-06-01&end_date=2026-06-30"
curl "http://localhost:8000/api/v1/savings-goal"
```

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
