## Why

The expense distribution donut tooltip currently renders the category name in green (`text-accent`), which conflicts with the dashboard's expense color semantics where spending-related labels and amounts use red. This inconsistency makes hover feedback harder to read at a glance and breaks visual alignment with the adjacent legend table.

## What Changes

- Update the expense distribution donut tooltip so the category name renders in red (`text-danger`) instead of green.
- Preserve green category text in the income distribution tooltip to maintain income semantics.
- Extend frontend chart tests to assert expense tooltip category color and income tooltip category color independently.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard-frontend`: Refine the donut segment hover requirement so expense distribution tooltips display category identity in red while income distribution tooltips retain green category identity.

## Impact

- Affected code: `frontend/src/components/charts/DistributionChart.tsx` and `DistributionChart.test.tsx`.
- Affected behavior: tooltip category text color only; no API, data model, or layout changes.
- Verification impact: frontend unit tests for distribution tooltip styling.
