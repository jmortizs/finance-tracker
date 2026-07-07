## Context

`DistributionChart` is shared by both the income and expense distribution panels. Its custom `DistributionTooltipContent` currently applies `text-accent` (green) to the category name for all distribution types. Expense table rows already use `text-danger` for amounts, but the tooltip category label does not follow the same expense semantics.

## Goals / Non-Goals

**Goals:**
- Render expense distribution tooltip category names in red using the existing `text-danger` token.
- Keep income distribution tooltip category names in green using `text-accent`.
- Cover both tooltip color paths with unit tests.

**Non-Goals:**
- Changing tooltip amount or percentage colors.
- Changing donut slice colors, legend table styling, or chart layout.
- Introducing new color tokens or tooltip components.

## Decisions

1. **Type-conditional category color in `DistributionTooltipContent`**
   - Apply `text-danger` when `point.type === "EXPENSE"`, otherwise `text-accent`.
   - Rationale: The component already receives `NormalizedDistributionPoint` with a `type` field, so no new props or chart variants are needed.
   - Alternative considered: Separate tooltip components per chart — rejected as unnecessary duplication for a one-line style change.

2. **Reuse existing Tailwind tokens**
   - Use `text-danger` (`#FF4D4D`) and `text-accent` (`#87E614`) already defined in `tailwind.config.ts`.
   - Rationale: Matches legend table expense amount styling and existing financial semantics.

## Risks / Trade-offs

- [Risk] Shared component could regress income tooltip styling → Mitigation: Add explicit income and expense tooltip tests asserting class names.
