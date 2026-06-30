## Why

The backend already exposes dashboard analytics endpoints, but there is no frontend for reviewing personal finance metrics locally. A read-only dashboard MVP will make the existing API useful as an operational finance surface and establish the frontend architecture for future finance workflows.

## What Changes

- Scaffold a Vite React TypeScript frontend under `frontend/`.
- Add a local dashboard UI wired to the existing FastAPI `/api/v1` analytics endpoints.
- Provide global filters for date range, bank, and account selection.
- Render summary metrics for balance, income, expenses, net savings, and savings percentage.
- Render analytical charts for balance evolution, cash flow, and income/expense category distribution.
- Add loading, empty, and error states for API-backed dashboard data.
- Integrate the frontend into local Docker orchestration and document how to run it.

## Capabilities

### New Capabilities
- `dashboard-frontend`: Covers the local read-only dashboard experience, including filter controls, metric summaries, chart visualizations, and API-backed state handling.

### Modified Capabilities

None.

## Impact

- Adds frontend source, package metadata, build tooling, and tests under `frontend/`.
- Updates `docker-compose.yml` with a frontend service for local development.
- Uses existing backend endpoints without changing their API contracts.
- Updates `README.md` with frontend run and verification instructions.
