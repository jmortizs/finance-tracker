## Context

The dashboard already renders a savings goal component directly beneath the KPI row. The current implementation uses a tall, highly saturated fill area and places the percentage label inside or adjacent to that fill, which makes the component visually louder than the surrounding metric and chart panels. The requested change is purely presentational: the same savings goal data, edit flow, and progress calculation should remain intact while the track becomes slimmer and easier to scan.

## Goals / Non-Goals

**Goals:**

- Make the progress track substantially narrower, closer to a video progress bar than a large block meter.
- Anchor the percentage label to the current progress point by placing it above a circular marker.
- Keep the current, target, start date, and end date labels readable within the existing compact dashboard layout.
- Use the same currency formatting style as other dashboard money amounts, including visible thousands separators.

**Non-Goals:**

- No changes to savings goal API contracts, persistence, or progress math.
- No changes to inline edit behavior or form validation.
- No new charting, animation, or third-party UI dependencies.

## Decisions

- Implement the slimmer track in the existing `SavingsProgressBar` component using layout and Tailwind class changes. This keeps the change local to the visual owner of the widget and avoids introducing a shared progress abstraction for one use case.
- Position the marker and percentage label from the existing normalized progress percentage. This preserves the current clamping behavior for fill width while visually connecting the label to the actual progress point.
- Format displayed goal amounts through the same number-formatting approach used by dashboard metric values. This fixes the comma visibility at the source of the display string instead of compensating with spacing or CSS.
- Keep tests focused on rendered output and edit behavior, with coverage for formatted money strings and the visible percentage label. The request does not require pixel-level visual snapshot testing.

## Risks / Trade-offs

- Marker labels near 0% or 100% can collide with container edges. Mitigation: clamp the marker position for display and use CSS transforms so the marker remains visually attached without overflowing badly.
- A very narrow track has less visual area for negative progress. Mitigation: preserve the existing positive and negative color semantics on both the fill and marker.
- Tests cannot fully prove visual proportions. Mitigation: assert structural rendering and formatting while using implementation classes for the slim track and marker placement.

## Migration Plan

Deploy as a normal frontend-only change. Rollback is limited to reverting the component and test edits.

## Open Questions

None.
