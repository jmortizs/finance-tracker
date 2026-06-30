## Why

The dashboard currently exposes implementation/status labels and chart color semantics that make the financial state harder to scan. The analytical views should communicate income, expense, cash flow, and balance movement consistently, with expenses and balance reductions immediately visible as negative financial activity.

## What Changes

- Remove visible "live" and "success" labels from dashboard graph and card surfaces.
- Render the cash flow chart as three time-series lines: green for income, red for expenses, and white for cash flow.
- Use red styling for expense-related values and balance-reduction indicators across cards, charts, and supporting labels.
- Validate that the balance evolution chart represents the final or closing balance for each month, not an ambiguous intra-month or cumulative display.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard-frontend`: Clarify dashboard status-label visibility, chart color semantics, cash flow line rendering, expense/reduction styling, and closing-balance interpretation.

## Impact

- Affects frontend dashboard presentation components, chart components, metric/card styling, and related frontend tests.
- May require backend/service test review only if balance evolution values are not already confirmed as monthly closing balances.
- No authentication, multi-user behavior, external cloud dependency, or new API endpoint is introduced.
