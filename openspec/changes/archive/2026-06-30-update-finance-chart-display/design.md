## Context

The frontend dashboard already renders metric cards and Recharts-based analytical panels for balance evolution, cash flow, and category distribution. Current metric cards show a visible `LIVE` badge, chart panels show raw resource statuses such as `success`, and the cash flow visualization combines income/expense bars with a lime net-savings line. The backend cash flow response already includes `income`, negative `expenses`, and `net_savings`; the balance evolution endpoint currently emits a running monthly balance.

This change is presentation-focused but touches multiple frontend components and requires verification that balance evolution semantics are correct for month-end reporting.

## Goals / Non-Goals

**Goals:**

- Remove visible success/live status badges from graph and card surfaces while preserving loading, empty, and error body states.
- Use consistent financial color semantics: income green, expenses and reductions red, and cash flow white.
- Render cash flow as three linear time-series lines using existing backend fields.
- Confirm the balance evolution chart represents closing balance per month and document/test that interpretation.

**Non-Goals:**

- No new dashboard endpoints, authentication, sessions, cloud services, or multi-user access controls.
- No new charting library or broad visual redesign outside the affected cards and charts.
- No change to transaction persistence or import behavior.

## Decisions

1. **Keep the existing Recharts implementation and convert cash flow to a line chart.**

   Recharts is already installed and aligned with the frontend guidance. Replacing the cash flow bars with three `Line` series keeps the implementation narrow and satisfies the requirement for green income, red expenses, and white cash flow. Alternative considered: keep bars for income/expenses and add color changes only. That would not satisfy the requested three-line cash flow chart.

2. **Use domain-aware props/classes for metric card color semantics.**

   The metric card should receive enough context to style expense values and unfavorable balance movement in red without guessing solely from the label string. Alternative considered: hard-code label checks inside the card. That is brittle if labels change and makes tests less direct.

3. **Remove passive success/live badges but keep actionable state surfaces.**

   The raw `success` and `LIVE` indicators add visual noise once data has loaded. Loading, empty, and error states should remain visible in the chart body because they communicate actual user-facing state. Alternative considered: hide all statuses entirely. That would weaken error and loading feedback.

4. **Validate balance evolution at the backend service boundary and frontend label/tooltip boundary.**

   The chart can only display the semantics of the API data it receives. Backend tests should assert each monthly point is the closing balance after that month, and frontend copy/tooltips should use closing-balance language where visible. Alternative considered: transform balance semantics in the chart only. That would hide a data contract ambiguity rather than resolving it.

## Risks / Trade-offs

- **Red expenses may compete with the existing limited palette** -> Use red only for expenses and reductions, while preserving black canvas, white typography, gray grid, and chartreuse accents elsewhere.
- **Cash flow line names could diverge from API field names** -> Keep data keys mapped directly to `income`, `expenses`, and `netSavings`, with display label "Cash flow" for `netSavings`.
- **Removing badges could make successful data state less explicit** -> Loaded chart/card content itself is the success signal; retain visible loading, empty, and error states.
- **Balance evolution may currently be cumulative from the first returned month, not true account closing balance** -> Add/adjust tests to lock the intended closing-balance behavior and update implementation only if the test exposes a mismatch.
