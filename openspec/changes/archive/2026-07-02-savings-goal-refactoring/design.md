## Context

The backend currently models `savings_goals` with a named goal, persisted `current_amount`, and `target_date`. Dashboard analytics are calculated through `FinanceRepository` and `AnalyticsEngine`, while the frontend dashboard fetches API-backed resources through `useDashboard` and renders a strict technical-minimalist layout.

The new goal behavior crosses database shape, backend calculation, API contract, and dashboard UX. Because this is a local single-user deployment, the design does not add multi-user ownership, authentication, or permission handling.

## Goals / Non-Goals

**Goals:**
- Represent the savings goal as one canonical record with mandatory `target_amount`, `start_date`, and `end_date` fields.
- Calculate goal progress dynamically from transactions inside the goal date range using income minus expenses.
- Expose backend endpoints for reading and updating the single savings goal.
- Render a dashboard savings goal card that ignores global filters and supports inline editing.
- Preserve existing dashboard metric and chart filtering behavior outside the savings goal card.

**Non-Goals:**
- Multiple concurrent goals, goal ownership, sessions, access tokens, or permission matrices.
- Persisted progress snapshots or historical goal progress records.
- Redirect-based goal management pages.

## Decisions

- Use the existing `savings_goals` table name and `SavingsGoal` ORM entity, but refactor fields to `target_amount`, `start_date`, and `end_date`.
  Alternative considered: add a new table and leave the old table intact. Rejected because the app is local, single-user, and there is no requirement to maintain legacy multi-goal data semantics.

- Treat the single record as the first row ordered by id and create it through the same upsert-style endpoint when missing.
  Alternative considered: require a database seed. Rejected because inline dashboard editing should be enough to initialize local deployments.

- Calculate progress in `AnalyticsEngine` from repository type totals with `start_date` and `end_date`, without passing global bank/account filters.
  Alternative considered: derive goal progress in the frontend from cash-flow chart data. Rejected because the backend owns financial aggregation and the card must ignore dashboard filters.

- Add dedicated `/api/v1/savings-goal` GET and PUT endpoints returning both goal configuration and calculated progress fields.
  Alternative considered: fold the card into `/dashboard/metrics`. Rejected because dashboard metrics are globally filter-aware, while savings goal is explicitly filter-isolated.

- Implement inline editing as a dashboard card with local form state and save/cancel controls.
  Alternative considered: add a modal or separate route. Rejected because the requirement specifies direct card management without page redirection.

## Risks / Trade-offs

- Existing local databases with old `savings_goals` columns may need migration handling outside `Base.metadata.create_all` in tests. Mitigation: keep model and code explicit, and document local schema expectations if README changes are needed.
- A missing goal cannot display meaningful progress. Mitigation: render an empty setup state with inline fields and create the single record on save.
- Negative net savings can produce a negative completion percentage. Mitigation: return the raw calculated percentage so the visualization reflects actual financial state rather than masking losses.
