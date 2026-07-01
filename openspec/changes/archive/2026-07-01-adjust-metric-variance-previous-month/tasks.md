## 1. Baseline Calculation

- [x] 1.1 Replace equal-length `_previous_period()` usage for dashboard metric variance with previous calendar month boundary calculation anchored on `end_date`.
- [x] 1.2 Add or adapt analytics helpers to return the previous month start date and previous month end date for any provided `end_date`.
- [x] 1.3 Preserve current fallback behavior for missing `end_date` until the API has an explicit month anchor.

## 2. Metric Implementation

- [x] 2.1 Update `AnalyticsEngine.get_dashboard_metrics()` so income, expenses, net savings, and savings percentage use previous calendar month totals for `previous_value` and `change_percent`.
- [x] 2.2 Implement closing balance calculation for balance current value as of the selected `end_date` and previous value as of the previous month end.
- [x] 2.3 Ensure bank and account filters are applied to both current metric calculations and previous month baseline calculations.
- [x] 2.4 Keep response schema, rounding, and zero-previous-value percentage behavior unchanged.

## 3. Repository Support

- [x] 3.1 Add repository support for calculating filtered totals through a cutoff date if existing range-total queries cannot produce closing balances.
- [x] 3.2 Ensure the closing balance query uses the same income-minus-expenses semantics as balance evolution.

## 4. Verification

- [x] 4.1 Update backend analytics engine tests to cover a multi-month selected range ending on 2026-06-30 with a previous month baseline ending on 2026-05-31.
- [x] 4.2 Add assertions for balance, income, expenses, net savings, and savings percentage `previous_value` and `change_percent` semantics.
- [x] 4.3 Run backend linting with the project-supported linter and the relevant backend test suite.
