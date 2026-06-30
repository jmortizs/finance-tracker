## 1. Status Label Cleanup

- [x] 1.1 Remove passive `LIVE` labels from metric cards while preserving metric loading placeholders.
- [x] 1.2 Remove visible `success` labels from chart panel headers while preserving loading, empty, idle, and error body states.
- [x] 1.3 Update metric and panel tests to assert loaded cards/charts do not expose passive live/success labels.

## 2. Financial Color Semantics

- [x] 2.1 Add explicit metric-card styling inputs or equivalent domain-aware logic for income, expenses, balance, net savings, and savings percentage.
- [x] 2.2 Render expense values and expense-related card context in red.
- [x] 2.3 Render unfavorable balance reductions and negative change indicators in red while preserving positive/neutral dashboard styling.
- [x] 2.4 Apply red expense semantics to expense chart labels, tooltips, or distribution values where spending data is displayed.

## 3. Cash Flow Chart

- [x] 3.1 Replace the cash flow bar/line composition with three linear Recharts lines using the existing `income`, `expenses`, and `netSavings` fields.
- [x] 3.2 Style income green, expenses red, and cash flow/net savings white.
- [x] 3.3 Update cash flow chart tests to verify all three series are rendered with the required labels and colors.

## 4. Balance Evolution Semantics

- [x] 4.1 Verify backend balance evolution output represents each month's final or closing balance after that month's income and expenses.
- [x] 4.2 Add or update backend tests to lock monthly closing-balance behavior.
- [x] 4.3 Update balance evolution chart labels, tooltip text, or tests so the frontend treats points as monthly closing balances.
- [x] 4.4 Ensure balance-reduction indicators in the balance evolution view use red semantics where applicable.

## 5. Verification

- [x] 5.1 Run frontend linting with `pnpm lint` from `frontend/`.
- [x] 5.2 Run frontend tests relevant to modified components from `frontend/`.
- [x] 5.3 Run backend linting with the repo's configured `ruff` or `flake8` command if backend files changed.
- [x] 5.4 Run backend tests relevant to balance evolution if backend files changed.
- [x] 5.5 Review `git diff` to confirm only intended files changed before commit and PR creation.
