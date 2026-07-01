## Context

The dashboard frontend already renders balance evolution, cash flow, and category distribution charts with a dark visual theme and financial color semantics. Current behavior has three UX defects: cash flow lines do not expose circular datapoint markers, income donut colors do not start with green-first ordering, and donut hover tooltips can appear blank or unreadable.

## Goals / Non-Goals

**Goals:**
- Align cash flow chart point visibility with the interaction pattern used in balance evolution.
- Enforce deterministic income donut color ordering where the first segment uses the primary green tone.
- Ensure donut hover tooltips always display readable category, amount, and share information.
- Preserve existing backend contracts and chart data endpoints.

**Non-Goals:**
- No backend API, aggregation, or schema changes.
- No redesign of dashboard layout, typography, or panel structure.
- No changes to expense distribution semantics beyond keeping existing red-first behavior intact.

## Decisions

1. Cash flow traces will explicitly enable point markers using the same line+marker rendering mode as the balance evolution chart.
   - Rationale: This provides consistent chart interaction and improves point-level readability.
   - Alternative considered: Keep line-only rendering and add markers on hover only; rejected because static point identification remains weak.

2. Income donut colors will use an explicit ordered palette with a primary green as index 0, then secondary greens/neutrals for additional categories.
   - Rationale: Deterministic color ordering avoids accidental white/neutral first slices and keeps income semantics clear.
   - Alternative considered: Rely on chart library default color cycle; rejected due to nondeterministic semantic mismatch.

3. Donut tooltip content and style will be explicitly configured (template text + contrast-safe background/foreground styles) rather than relying on default hover labels.
   - Rationale: Explicit tooltip configuration prevents blank labels and illegible text in dark theme contexts.
   - Alternative considered: Keep defaults and tune global CSS only; rejected because library-generated tooltip markup may bypass panel-level styles.

## Risks / Trade-offs

- Marker clutter on narrow screens or dense timelines -> Mitigation: keep marker radius small and reuse existing responsive chart sizing.
- Stronger green palette differentiation may be subtle for some users -> Mitigation: retain table legend values and percentage labels as non-color cues.
- Tooltip template divergence from other charts may increase maintenance -> Mitigation: centralize tooltip formatter usage where chart configs are shared.
