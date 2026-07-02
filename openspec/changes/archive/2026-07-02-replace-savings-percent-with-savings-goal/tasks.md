## 1. Dashboard Layout Replacement

- [x] 1.1 Locate the dashboard metric row and current savings goal card implementation.
- [x] 1.2 Remove the visible `Savings %` KPI card from the metric row without altering backend metric data handling.
- [x] 1.3 Mount the existing savings goal card in the far-right top-row slot using the metric card dimensions, padding, and responsive grid constraints.
- [x] 1.4 Remove the duplicate lower savings goal panel if the relocated card fully preserves the existing savings goal functionality.

## 2. Functional Parity

- [x] 2.1 Preserve savings goal data fetching independent of global dashboard filters.
- [x] 2.2 Preserve display of target amount, completion percentage, progress amount, and deadline.
- [x] 2.3 Preserve inline edit/save/cancel behavior for target amount, start date, and end date.
- [x] 2.4 Confirm adjacent Balance, Income, Expenses, and Net Savings cards still render unchanged.

## 3. Verification

- [x] 3.1 Add or update frontend tests for hiding `Savings %`, top-row savings goal placement, and required savings goal fields.
- [x] 3.2 Run frontend verification commands for the modified dashboard area.
- [x] 3.3 Run OpenSpec verification and archive the completed change.
