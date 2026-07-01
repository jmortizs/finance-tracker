## Why

The dashboard currently renders date selectors from static frontend defaults instead of the actual transaction data range. This can cause the initial view and reset behavior to omit available transactions or point at dates that are not represented in the local database.

## What Changes

- Add transaction date bounds to the filter-options data used by the dashboard frontend.
- Default the frontend start date selector to the oldest `transactions.transaction_date` value.
- Default the frontend end date selector to the most recent `transactions.transaction_date` value.
- Reapply those same data-driven date defaults when the user resets filters.
- Preserve the existing bank and account filter behavior.

## Capabilities

### New Capabilities

### Modified Capabilities
- `dashboard-frontend`: Global dashboard filters SHALL initialize and reset date selectors from the oldest and most recent transaction dates recorded in the transactions table.

## Impact

- Affected API behavior: `/api/v1/filters/options` will include minimum and maximum transaction dates in addition to banks and accounts.
- Affected backend code: filter option schemas, analytics service, and repository queries for transaction date bounds.
- Affected frontend code: dashboard filter types, default filter initialization, reset behavior, and date selector rendering.
- Affected tests: backend filter option coverage and frontend dashboard filter initialization/reset tests.
- Dependencies: no new runtime dependencies expected.
