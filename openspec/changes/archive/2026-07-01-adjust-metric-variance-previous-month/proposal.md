## Why

Dashboard metric variance currently compares the selected date range against an equally long period immediately before the range. For broad or custom ranges, this makes the percentage change represent a prior-range comparison instead of the expected month-over-month movement from the previous month closing point.

## What Changes

- Adjust dashboard metric variance so percentage change is calculated relative to the previous calendar month.
- For a selected range ending on a date such as 2026-06-30, compare current metric values against the corresponding previous-month baseline ending on 2026-05-31.
- Apply this previous-month baseline consistently to all dashboard metrics that expose previous value or percentage change context.
- Preserve the existing metric response shape and filtering inputs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard-frontend`: Dashboard metrics SHALL present previous value and percentage change context using the previous calendar month baseline supplied by the backend metrics endpoint.

## Impact

- Affected code: `backend/app/services/analytics_engine.py`
- Affected tests: backend analytics engine tests covering metric previous values and percentage changes.
- Affected API behavior: `/api/v1/dashboard/metrics` keeps the same schema, but `previous_value` and `change_percent` semantics change from previous equally sized period to previous calendar month baseline.
- Dependencies: no new runtime dependencies expected.
