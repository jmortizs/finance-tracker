## Why

The dashboard chart styling has visual inconsistencies and poor hover readability that reduce clarity during analysis. Fixing these issues now aligns chart behavior with existing financial semantics and improves usability without changing data contracts.

## What Changes

- Add circular point markers to each cash flow line datapoint so the chart matches the balance evolution interaction pattern.
- Update income distribution donut color scale ordering so the first slice starts with green-first income semantics, analogous to the red-first ordering used by expense distribution.
- Fix donut segment hover tooltip rendering so hovered slices always show legible, non-empty content.
- Add/adjust frontend chart tests or configuration checks that validate marker visibility, color ordering, and tooltip content/contrast behavior.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard-frontend`: Analytical chart rendering requirements are refined to include cash flow datapoint markers, explicit income donut color ordering, and legible donut hover tooltips.

## Impact

- Affected code: frontend dashboard chart components and chart configuration for cash flow and distribution visuals.
- Affected behavior: visual presentation and hover interaction in existing charts; no backend API or schema changes.
- Verification impact: frontend chart rendering/interaction tests may need updates to cover the new presentation requirements.
