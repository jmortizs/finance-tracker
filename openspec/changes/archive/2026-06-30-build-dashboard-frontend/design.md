## Context

The project currently has a Dockerized FastAPI backend and PostgreSQL database. The backend exposes read-only analytics endpoints under `/api/v1` for filter options, dashboard metrics, balance evolution, cash flow, and category distribution. The `frontend/` boundary exists with project-specific design instructions, but there is no application scaffold yet.

The dashboard is a local, single-user operational surface. It must stay focused on financial clarity, deterministic local deployment, and the existing backend analytics contract.

## Goals / Non-Goals

**Goals:**

- Build a Vite React TypeScript dashboard MVP under `frontend/`.
- Use Tailwind CSS for the required technical-minimalist visual system.
- Use Recharts for line, bar, and distribution visualizations.
- Fetch all visible dashboard data from the existing FastAPI analytics endpoints.
- Provide global date, bank, and account filters that drive supported dashboard requests.
- Add local development orchestration through Docker Compose.
- Add frontend lint, test, and build checks.

**Non-Goals:**

- No authentication, session handling, user management, or permission model.
- No transaction, account, category, or savings-goal CRUD.
- No backend analytics contract changes unless implementation uncovers a blocking integration defect.
- No external hosted services, telemetry, or cloud dependencies.
- No production hosting architecture beyond local Docker development.

## Decisions

1. **Use Vite React TypeScript as the frontend foundation.**

   This matches the frontend instructions and keeps the local development loop fast. Alternatives considered were Next.js and plain static HTML. Next.js adds routing and server concerns that are unnecessary for a single local dashboard, while static HTML would make typed API integration and component testing weaker.

2. **Use Tailwind CSS with global design tokens for the strict visual system.**

   The frontend instructions require black canvas, white monospace typography, gray dividers, chartreuse accents, and zero-radius elements. Tailwind can enforce these decisions consistently while keeping component markup readable. A component library is not appropriate because most libraries assume rounded, animated, filled, or multi-color controls that would fight the required visual language.

3. **Use Recharts for dashboard visualizations.**

   Recharts integrates cleanly with React and supports Cartesian grids, linear line interpolation, bar charts, and pie/donut charts. Chart.js is also viable, but Recharts keeps chart composition closer to React component state and makes per-chart empty/loading states simpler.

4. **Use a relative frontend API client with a Vite development proxy.**

   The browser will call `/api/v1/...` from the frontend origin, and Vite will proxy those requests to the backend service. This avoids adding CORS middleware to FastAPI for the MVP and keeps the API client deployable behind a same-origin reverse proxy later. In Docker, the proxy target can use the backend service name; locally, it can target `localhost:8000`.

5. **Keep dashboard state local to the app.**

   A small set of React hooks and typed request helpers is sufficient for the MVP. Global state libraries are unnecessary because filters and dashboard data live within one page-level workflow.

6. **Load independent dashboard resources in parallel.**

   Filter options, metrics, balance evolution, cash flow, and distributions can be requested independently. The UI should show partial failure states at the panel level where practical, with a page-level error only when the app cannot load enough data to render the dashboard frame.

## Risks / Trade-offs

- **Vite proxy hides CORS issues that may appear under a different deployment topology** -> Document the dev proxy assumption and keep API calls relative so a future reverse proxy can preserve same-origin behavior.
- **Charts can become unreadable with dense seeded or future real data** -> Format dates at month granularity, use responsive chart containers, and reserve tabular/tooltip detail for precise values.
- **Backend decimal values arrive as JSON numbers or strings depending on serializer behavior** -> Normalize API response values through explicit frontend parsing before formatting and charting.
- **Account and bank filters can conflict** -> When a bank is selected, constrain account options to that bank and clear an incompatible selected account.
- **Docker frontend dependency installs can slow local startup** -> Use a pnpm lockfile and cache-friendly Dockerfile layering during implementation.

## Migration Plan

1. Scaffold frontend source, package metadata, Tailwind configuration, and test tooling under `frontend/`.
2. Add a Docker frontend service and connect it to the existing backend service.
3. Implement the dashboard UI against the existing seeded backend data.
4. Update README run and verification instructions.
5. Rollback is file-level: remove the frontend service and `frontend/` scaffold if the MVP needs to be abandoned before archive.

## Open Questions

- Should the implementation include a production static container now, or defer that until after the dashboard MVP is validated in development?

## Answers to Open Questions
- Defer production static container until after the dashboard MVP is validated in development.
