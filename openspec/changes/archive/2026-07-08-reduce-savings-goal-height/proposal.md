## Why

The savings goal component currently consumes more vertical space than needed, reducing the chart area available below it in the single-viewport dashboard. Tightening its configured display reclaims space for analytical charts while keeping the savings goal readable and editable.

## What Changes

- Reduce the vertical footprint of the configured savings goal progress bar.
- Preserve the existing savings goal content: title, edit action, current amount, target amount, date bounds, progress track, marker, and percentage label.
- Keep the setup/edit form usable without changing savings goal API behavior.
- Ensure the dashboard continues to fit within the desktop viewport and allows chart panels to benefit from the reclaimed vertical space.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard-frontend`: Tighten the dashboard savings progress bar requirement so the configured savings goal region remains compact and yields more vertical space to the chart grid below.

## Impact

- `frontend/src/components/SavingsProgressBar.tsx`
- `frontend/src/App.tsx` if row sizing needs an explicit compact constraint
- Frontend component tests covering the savings goal/dashboard layout
- No backend API, database, or dependency changes
