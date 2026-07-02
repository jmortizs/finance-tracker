## Why

Savings goal progress should reflect actual net savings during the goal period instead of relying on duplicated or manually maintained progress state. Managing the goal directly from the dashboard reduces navigation friction and keeps goal configuration close to the visualization users rely on.

## What Changes

- Store the savings goal as a single mandatory record with `target_amount`, `start_date`, and `end_date`.
- Calculate progress dynamically as income minus expenses incurred strictly within the goal's own date range.
- Ensure the dashboard savings goal card ignores global dashboard date filters.
- Display target amount, completion percentage, and deadline on the dashboard card.
- Allow inline editing of target amount, start date, and end date directly within the dashboard card.

## Capabilities

### New Capabilities
- `savings-goal`: Defines storage, calculation, API, and dashboard behavior for the single savings goal.

### Modified Capabilities
- `dashboard-frontend`: Dashboard savings goal card behavior changes to ignore global filters and support inline editing.

## Impact

- Backend data model, migrations, schemas, CRUD/service logic, and API endpoints for savings goal management.
- Transaction aggregation logic used to calculate net savings within the goal date range.
- Dashboard frontend state, API client usage, card rendering, and inline editing UX.
- Tests for storage, calculation, filter isolation, API updates, and dashboard behavior.
