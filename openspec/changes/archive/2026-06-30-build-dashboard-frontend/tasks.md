## 1. Frontend Scaffold

- [x] 1.1 Initialize a Vite React TypeScript app structure under `frontend/` using pnpm-managed package metadata.
- [x] 1.2 Add Tailwind CSS, PostCSS, TypeScript, ESLint, Vitest, React Testing Library, Recharts, and required React dependencies.
- [x] 1.3 Configure global styles and Tailwind tokens for the black, white, gray, chartreuse, monospace, zero-radius dashboard design system.
- [x] 1.4 Add a Vite development proxy so relative `/api/v1` browser requests route to the FastAPI backend.

## 2. API Client and Dashboard State

- [x] 2.1 Define TypeScript types matching the existing filter, metrics, balance evolution, cash flow, and distribution API responses.
- [x] 2.2 Implement typed API helpers for `/api/v1/filters/options`, `/dashboard/metrics`, `/dashboard/charts/balance-evolution`, `/dashboard/charts/cash-flow`, and `/dashboard/charts/distribution`.
- [x] 2.3 Implement dashboard state hooks for filters, parallel data loading, value normalization, and per-region loading/error/empty states.
- [x] 2.4 Ensure bank selection constrains account options and clears incompatible account selections.

## 3. Dashboard Interface

- [x] 3.1 Build the application shell with global control sidebar, metrics header row, and primary analytical visualization canvas.
- [x] 3.2 Build date range, bank, account, reset, and refresh controls using the required sharp technical-minimalist styling.
- [x] 3.3 Build metric summary components for balance, income, expenses, net savings, and savings percentage with variation context.
- [x] 3.4 Build reusable panel states for loading, empty, and error conditions.

## 4. Chart Visualizations

- [x] 4.1 Implement the balance evolution chart as a linear Recharts line chart with required grid and stroke styling.
- [x] 4.2 Implement the cash flow chart with income, expenses, and net savings displayed over time.
- [x] 4.3 Implement income and expense category distribution views using backend distribution data.
- [x] 4.4 Add chart tooltips, numeric formatting, month labels, and responsive sizing that preserve readability across desktop and mobile widths.

## 5. Local Orchestration and Documentation

- [x] 5.1 Add a frontend Dockerfile or compose-compatible dev command for running the Vite app locally.
- [x] 5.2 Update `docker-compose.yml` with a frontend service that depends on the backend and exposes a documented local port.
- [x] 5.3 Update `README.md` with frontend service details, dashboard URL, API proxy behavior, and frontend verification commands.

## 6. Verification

- [x] 6.1 Add focused tests for API query construction, filter/account constraints, metric rendering, and panel state behavior.
- [x] 6.2 Run frontend lint, tests, and production build from `frontend/`.
- [x] 6.3 Run existing backend checks relevant to unchanged API integration if backend files are modified.
- [x] 6.4 Run OpenSpec validation/status for `build-dashboard-frontend` and confirm the change is ready for implementation review.
