## Context

The dashboard is constrained to a single desktop viewport with the metric row, savings goal bar, and chart grid stacked in the main content area. The configured savings goal view currently uses generous section padding and vertical progress-track padding, which increases the auto-sized row above the chart grid.

## Goals / Non-Goals

**Goals:**

- Reduce the configured savings goal component height so more vertical space is available to the chart grid.
- Preserve the existing visual model: bounded amounts, date labels, a narrow track, marker, percentage label, and edit action.
- Keep inline setup/edit controls functional and readable.

**Non-Goals:**

- Do not change savings goal API behavior or progress calculation.
- Do not redesign the dashboard grid or chart components.
- Do not remove any displayed savings goal information.

## Decisions

- Compact the configured display inside `SavingsProgressBar` instead of changing chart row math. This addresses the cause of the lost space: the component's own padding and track wrapper height.
- Keep a distinct form layout for setup/editing. The edit state can remain taller because it is transient and requires accessible form controls; the steady-state configured display is what should maximize chart area.
- Preserve the existing 1px divider model from `App` by avoiding external margins or new inter-widget gaps.

## Risks / Trade-offs

- Compact spacing could make the marker label feel crowded on small widths -> Preserve enough vertical room around the percentage label and avoid overlapping the amount/date bounds.
- Making only the configured state compact means edit mode still consumes more height -> Acceptable because edit mode prioritizes form usability and is not the steady analytical view.
