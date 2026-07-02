## Context

The dashboard already fetches savings goal data independently of global filters and renders a savings goal card with target amount, completion percentage, progress amount, deadline, and inline editing. The current visual layout places balance, income, expenses, net savings, and savings percentage in the top metric row, while savings goal appears in a larger section below.

## Goals / Non-Goals

**Goals:**
- Replace the visible top-row `Savings %` KPI with the existing savings goal visualization/card.
- Maintain the top-row card footprint so the summary grid remains aligned across desktop and responsive breakpoints.
- Preserve existing savings goal API calls, derived values, deadline display, and edit workflow.
- Avoid regressions to balance, income, expenses, and net savings cards.

**Non-Goals:**
- Backend changes to savings goal storage, progress calculation, or API contracts.
- New savings goal calculations, new visualizations, or multi-goal support.
- Changes to global dashboard filters or adjacent chart behavior.

## Decisions

- Reuse the existing savings goal card data and edit handlers instead of introducing a second savings goal fetch path.
  Alternative considered: create a new compact savings goal API client or duplicate state. Rejected because the existing card already owns the required functional behavior.

- Add a compact top-row presentation mode only if the existing full-width markup cannot preserve the original metric-card footprint.
  Alternative considered: move the existing large card unchanged into the metric grid. Rejected because the new card must inherit the dimensions and constraints of the old KPI card.

- Remove the standalone lower savings goal panel once the same functional component is mounted in the metric row.
  Alternative considered: render savings goal in both locations. Rejected because the requirement is replacement, not duplication.

## Risks / Trade-offs

- The existing savings goal edit controls may need compact styling to fit inside the metric-card height. Mitigation: keep the same edit state and fields while adjusting presentation only.
- Tests that assumed five numeric metric cards may need updating to assert four adjacent KPI cards plus the savings goal card.
