## Context

The dashboard already loads savings goal data independently from global dashboard filters and renders a savings goal card with target amount, completion percentage, progress amount, deadline, and inline editing. The current visual layout places that card below the top metric grid while the grid still includes a narrower `Savings %` metric card.

This change is a layout rearrangement. It must reuse the existing savings goal data flow and card behavior instead of adding new backend logic or duplicate frontend calculations.

## Goals / Non-Goals

**Goals:**
- Remove the `Savings %` KPI from the top metric grid.
- Place the existing savings goal card in the far-right top-grid position.
- Keep balance, income, expenses, and net savings cards unchanged.
- Keep savings goal target, completion, progress, deadline, loading, error, setup, and edit behavior intact.

**Non-Goals:**
- Backend API changes.
- New savings goal calculations.
- New user management, sessions, access tokens, or permissions.
- Redesigning unrelated chart or filter areas.

## Decisions

- Reuse the existing savings goal component in the grid instead of creating a second compact goal card.
  Alternative considered: build a duplicate top-row-only summary component. Rejected because it risks diverging from existing state, editing, and formatting behavior.

- Remove only the `Savings %` metric card from the dashboard metric map and keep the backend metrics response unchanged.
  Alternative considered: remove `savings_percentage` from API contracts. Rejected because the requirement is strictly UI layout rearrangement.

## Risks / Trade-offs

- The existing savings goal card may have dimensions designed for the wider lower row. Mitigation: adapt CSS/layout minimally so it fits the metric grid slot while preserving displayed fields.
- Tests that query all metric cards may need updates because `Savings %` is intentionally deprecated from the visible top bar.
