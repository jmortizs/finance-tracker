## Context

The dashboard currently renders `SavingsGoalCard` with `variant="metric"` in the fifth slot of the top metrics grid. The savings goal API and `useDashboard` hook already provide normalized goal data (`progress`, `targetAmount`, `startDate`, `endDate`, `completionPercentage`) independent of global filters. This change is a frontend-only layout and presentation refactor aligned with the provided mockup.

## Goals / Non-Goals

**Goals:**
- Replace the metric-row savings goal card with a full-width `SavingsProgressBar` below the metrics header row.
- Calculate and display progress percentage client-side as `(progress / targetAmount) * 100` with one decimal place.
- Support zero, positive (accent/green), and negative (danger/red) visual states.
- Reuse the existing inline edit/save workflow via the EDIT button.
- Use existing Tailwind design tokens (`canvas`, `ink`, `grid`, `accent`, `danger`, `muted`) with responsive flex layout.

**Non-Goals:**
- Backend schema, API, or calculation changes.
- New CSS variables or global stylesheet rules.
- Changes to chart panels or filter sidebar behavior.

## Decisions

1. **Component split**: Create `SavingsProgressBar.tsx` for display and progress logic; extract or inline the edit form from `SavingsGoalCard` within the new component (or a small shared form subcomponent) so `SavingsGoalCard` can be removed from `App.tsx`.
2. **Layout placement**: Change the metrics grid from `xl:grid-cols-5` to `xl:grid-cols-4` (four KPI cards only). Mount `SavingsProgressBar` in a new section immediately after the metrics grid with `border border-grid bg-canvas p-4`.
3. **Progress fill width**: Use `Math.min(Math.abs(percentage), 100)` for bar width to avoid overflow; display signed percentage text separately.
4. **Memoization**: Wrap `SavingsProgressBar` in `React.memo` to avoid unnecessary re-renders when unrelated dashboard state updates.
5. **Money display**: Match mockup suffix style (`200$`) via a compact formatter or adapt `formatMoney` output for this component only.

## Risks / Trade-offs

- **[Risk] Removing `SavingsGoalCard` breaks existing tests** → Update `SavingsGoalCard.test.tsx` to `SavingsProgressBar.test.tsx` and adjust `App.test.tsx` mocks.
- **[Risk] Edit form UX regression** → Preserve the same form fields, validation, and `onSave` callback contract from the card component.
- **[Trade-off] `SavingsGoalCard` may become unused** → Remove metric variant from card or delete card if no longer referenced.

## Migration Plan

1. Implement `SavingsProgressBar` and wire into `App.tsx`.
2. Remove `SavingsGoalCard` from metrics row.
3. Update frontend tests and run lint/test/build.
4. Archive OpenSpec change and sync delta specs.

## Open Questions

_None._
