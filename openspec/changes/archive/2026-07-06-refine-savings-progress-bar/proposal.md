## Why

The savings goal progress bar currently dominates the dashboard compared with adjacent chart and metric elements. Its large track and hard-to-read money formatting make the widget feel visually inconsistent even though the underlying goal behavior is correct.

## What Changes

- Reduce the visual weight of the savings goal progress track so it reads more like a slim video progress bar.
- Add a circular marker at the current progress position and place the percentage label directly above that marker.
- Correct displayed savings goal money formatting so comma separators are visible and consistent with the dashboard KPI amounts.
- Preserve existing savings goal loading, empty, edit, save, and progress calculation behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard-frontend`: refine the visual presentation requirements for the savings goal progress bar.

## Impact

- Affected frontend component: `frontend/src/components/SavingsProgressBar.tsx`
- Affected frontend tests: `frontend/src/components/SavingsProgressBar.test.tsx`
- No backend API, database, Docker, or dependency changes expected.
