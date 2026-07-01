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
On startup the backend creates the PostgreSQL schema from `backend/specs.md` and loads
deterministic mock data for local API testing. To start with an empty database, set
`SEED_MOCK_DATA=false` for the backend service.

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

`GET /api/v1/filters/options` returns banks, accounts, and nullable
`min_transaction_date` / `max_transaction_date` bounds for dashboard date defaults.
Optional dashboard filters use `start_date`, `end_date`, `bank_id`, and `account_id` where supported by the endpoint.

Example seeded API calls:

```bash
curl "http://localhost:8000/api/v1/filters/options"
curl "http://localhost:8000/api/v1/dashboard/metrics?start_date=2026-06-01&end_date=2026-06-30"
curl "http://localhost:8000/api/v1/dashboard/charts/distribution?type=EXPENSE&start_date=2026-06-01&end_date=2026-06-30"
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
