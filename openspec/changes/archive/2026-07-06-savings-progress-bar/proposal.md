## Why

The current savings goal card in the metrics row duplicates layout patterns meant for KPI metrics and does not communicate goal progress as clearly as a dedicated linear progress bar. Replacing it with a full-width progress component beneath the metrics row improves scanability and aligns the dashboard with the updated savings goal visualization design.

## What Changes

- Remove the savings goal card from the top metrics header row.
- Add a new `SavingsProgressBar` component mounted directly below the metrics row.
- Display current savings, target amount, start date, end date, and a dynamic percentage overlay on a horizontal progress track.
- Render zero, positive (green), and negative (red) progress states based on client-side percentage calculation.
- Wire the EDIT button to the existing inline savings goal edit workflow without backend changes.

## Capabilities

### New Capabilities

_None — this is a frontend presentation refactor using existing savings goal data._

### Modified Capabilities

- `dashboard-frontend`: Replace the savings goal metric-row card requirement with a savings progress bar requirement positioned below the metrics header row.

## Impact

- `frontend/src/App.tsx` dashboard layout and component hierarchy.
- New `SavingsProgressBar` component and related tests.
- Deprecation/removal of metric-row usage of `SavingsGoalCard`; edit form logic may be extracted or reused.
- No backend API, schema, or endpoint changes.
