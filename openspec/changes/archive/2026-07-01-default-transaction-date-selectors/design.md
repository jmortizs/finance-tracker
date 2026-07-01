## Context

The frontend initializes `DashboardFilters` from static defaults and renders date inputs directly from that state. The backend filter-options endpoint currently returns banks and accounts, but it does not expose the transaction date range that the frontend needs to choose data-driven defaults.

The transaction table already stores `transaction_date` with date indexes, and all dashboard filterable endpoints accept `start_date` and `end_date`. This change should extend the existing local API contract without adding new endpoints, authentication, or external dependencies.

## Goals / Non-Goals

**Goals:**
- Expose the oldest and most recent transaction dates from the transactions table through the existing filter-options workflow.
- Initialize the frontend date selectors from those backend-provided date bounds after filter options load.
- Reset date filters back to those backend-provided bounds while preserving existing bank/account reset behavior.
- Keep dashboard data requests using the existing `start_date` and `end_date` query parameters.

**Non-Goals:**
- Add new dashboard filter types or analytics endpoints.
- Change chart or metric calculations beyond the selected date range produced by the filters.
- Add multi-user preferences, sessions, or persisted frontend settings.
- Add external date libraries or new runtime services.

## Decisions

1. Extend `/api/v1/filters/options` with `min_transaction_date` and `max_transaction_date`.

   The frontend already loads this endpoint before populating global filter controls, so adding bounds there keeps all filter option metadata in one request. The backend should calculate the values with an aggregate query over `transactions.transaction_date`.

   Alternative considered: create a dedicated date-range endpoint. That would be easy to reason about but adds another request and API surface for metadata that belongs to the same global filter workflow.

2. Represent date bounds as nullable ISO date strings in the API response.

   PostgreSQL may contain no transactions in an empty local database. Nullable bounds let the backend accurately represent that state without inventing fake dates. When bounds are present, they should serialize as `YYYY-MM-DD`, matching the existing date input and query parameter format.

   Alternative considered: make bounds required and fall back to today's date. That hides empty-data behavior and can make the default dashboard request imply records exist for dates that are not in the database.

3. Keep frontend date state controlled by `DashboardFilters`, but derive the initial and reset values from loaded filter options.

   The hook should update date filters when filter options first succeed and the current date values still match the static initial empty/default state. Reset should derive the same bounds from the latest loaded options. This keeps the sidebar as a controlled form and avoids fetching dashboard data with hard-coded dates after metadata is available.

   Alternative considered: make the sidebar inputs read directly from option data. That couples presentation to API loading state and makes user edits harder to preserve.

4. Leave user-edited dates intact after refreshes unless the user resets filters.

   Reloading filter options should not overwrite date selections the user has already changed. The default range is an initialization and reset behavior, not a forced synchronization on every metadata request.

   Alternative considered: always overwrite date fields from transaction bounds whenever filter options reload. That keeps bounds current but creates surprising UI changes during refreshes.

## Risks / Trade-offs

- Empty transaction table returns no date bounds -> keep date inputs empty and allow dashboard requests to omit date query parameters.
- Filter options fail to load -> keep existing error state and existing in-memory filter values rather than blocking the dashboard shell.
- New response fields could break overly strict frontend mocks or tests -> update shared TypeScript types and backend/frontend test fixtures together.
- Date bounds may change after new data is inserted while the frontend is open -> preserve user selections until refresh or reset, and derive reset defaults from the latest successful options payload.

## Migration Plan

1. Add repository support for reading minimum and maximum `transactions.transaction_date` values.
2. Extend backend filter option schema and service mapping to return nullable transaction date bounds.
3. Extend frontend filter option types and helper utilities to derive default filters from date bounds.
4. Update hook behavior so successful option loading initializes date filters from bounds without overriding user-edited dates.
5. Update reset behavior to use the latest loaded date bounds.
6. Add or update backend and frontend tests, then run relevant lint and test commands.

Rollback is file-level: remove the added response fields and frontend default-date derivation to restore static filter defaults.

## Open Questions

- None.
