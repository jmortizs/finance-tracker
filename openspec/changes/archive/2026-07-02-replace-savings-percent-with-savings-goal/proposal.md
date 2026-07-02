## Why

The top-row Finance Overview metric grid currently includes a `Savings %` KPI card even though the dashboard already has a richer API-backed savings goal component. The goal card is more actionable because it shows target, completion, progress amount, and deadline in one place.

## What Changes

- Remove the `Savings %` KPI card from the top metric grid.
- Render the existing savings goal card in the far-right top-grid slot previously occupied by `Savings %`.
- Preserve the existing savings goal data loading, progress calculation, deadline display, and inline edit behavior.
- Preserve adjacent metric cards for balance, income, expenses, and net savings.

## Capabilities

### Modified Capabilities
- `dashboard-frontend`: Updates the Finance Overview top metric layout to replace the `Savings %` summary card with the existing savings goal component.

## Impact

- Frontend dashboard layout and component composition only.
- No backend savings goal API, calculation, persistence, or data contract changes.
- Frontend tests may need updates to assert the new top-row placement and absence of the deprecated KPI card.
