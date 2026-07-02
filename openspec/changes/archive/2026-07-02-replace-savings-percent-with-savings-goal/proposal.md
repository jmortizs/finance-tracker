## Why

The Finance Overview top metric row currently includes a `Savings %` KPI card while the full savings goal panel renders below the metrics. The requested dashboard layout should make savings goal progress available in the far-right top-row slot without changing the existing savings goal data model, calculations, or API behavior.

## What Changes

- Remove the visible `Savings %` KPI card from the top summary metric grid.
- Render the existing Savings Goal / Goal Progress card in the far-right top-row metric slot.
- Preserve the top metric card dimensions, padding, and responsive grid alignment for the relocated card.
- Keep existing savings goal fetching, progress calculation, completion percentage, progress amount, deadline, and inline edit behavior intact.

## Capabilities

### Modified Capabilities
- `dashboard-frontend`: Updates the dashboard metric row composition and savings goal card placement.

## Impact

- Frontend dashboard component layout and styling for the metric row and savings goal card.
- Frontend rendering tests for metric-card visibility and savings goal data fields.
- No backend API, data model, or calculation changes are expected.
