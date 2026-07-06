## Context

The dashboard (`frontend/src/App.tsx`) renders a `min-h-screen` page split into a fixed-width `FilterSidebar` and a `<main>` column containing, top to bottom: a decorative header ("LOCAL ANALYTICS" / "FINANCE OVERVIEW" / "API /api/v1" badge), a 4-card KPI grid, a Savings Goal bar wrapped in a padded section, and a 2x2 chart grid with `gap-4 p-4 sm:p-6` spacing. Charts use Recharts `ResponsiveContainer` inside wrappers with fixed heights (`h-[320px]` for line charts, `h-[280px]` for donuts). The page grows past one viewport on common desktop resolutions and scrolls vertically.

Design-system constraints (frontend AGENTS.md): pure black canvas, `1px solid #1C1C1C` structural borders, no border radius, no animations. The `gap-px bg-grid p-px` technique is already used by the KPI row to draw hairline dividers between adjacent cells.

## Goals / Non-Goals

**Goals:**
- All dashboard widgets visible within a single viewport (no vertical scroll on the main container) at 1920x1080, 1440x900, and 1366x768.
- Remove the top header section entirely.
- Zero interstitial gaps/margins/external padding between widgets; adjacent widgets separated only by 1px grid-colored dividers.
- Widgets flex to fill reclaimed vertical space; charts resize fluidly with their container.
- Keep internal widget padding and axis/text readability intact.

**Non-Goals:**
- No changes to `FilterSidebar` structure, styling, or behavior.
- No changes to data fetching, API contracts, or backend.
- No mobile-specific single-viewport guarantee: below the `lg` breakpoint the sidebar stacks above the content, so the strict no-scroll constraint applies to desktop (`lg+`) layouts only.

## Decisions

1. **Viewport lock via `h-dvh` + `overflow-hidden` on the app shell, `overflow-hidden` on `<main>`.**
   The root wrapper changes from `min-h-screen` to `lg:h-dvh lg:overflow-hidden` (small screens keep natural flow/scroll since the stacked sidebar makes one-viewport impossible). `dvh` avoids the mobile-browser 100vh trap and behaves identically to `vh` on desktop. Alternative considered: `position: fixed` shell — rejected as unnecessary and more invasive.

2. **CSS Grid rows on `<main>` instead of nested flex.**
   `<main>` becomes `grid grid-rows-[auto_auto_minmax(0,1fr)]`: KPI row (auto), Savings Goal (auto), chart grid (fills the remainder). `minmax(0,1fr)` is critical so the chart row can shrink below content size, letting Recharts' `ResponsiveContainer` track the available space. Alternative: flex column with `flex-1 min-h-0` children — equivalent; grid chosen because the chart area itself is already a grid and row sizing is declared in one place.

3. **Hairline dividers via the existing `gap-px bg-grid p-px` pattern, applied uniformly.**
   The KPI row already uses this pattern. The whole `<main>` adopts it once (`gap-px bg-grid p-px` on the outer grid), and the inner chart grid uses `gap-px bg-grid` (no extra `p-px`, the outer one provides the frame). This removes `gap-4`, `p-4`, `sm:p-6`, and section borders while preserving the design system's 1px structural bounds. Alternative: per-widget `border` classes — rejected because adjacent borders double to 2px or need error-prone collapse tricks.

4. **Charts become fluid-height: replace `h-[320px]`/`h-[280px]` with `h-full` and give panels `min-h-0` flex plumbing.**
   `ChartPanel` becomes a `flex h-full min-h-0 flex-col` with the body `min-h-0 flex-1`; chart wrappers use `h-full` with a small minimum (`min-h-[160px]`) as a readability floor. `ResponsiveContainer width="100%" height="100%"` already supports this — only the fixed-height wrappers change. Recharts recalculates via a debounced ResizeObserver, so resize cost is unchanged from today (no new listeners, no layout thrash).

5. **Chart grid is 2x2 at `lg` (was `2xl`).**
   Four stacked full-width charts cannot fit one viewport at 768px height; a 2x2 grid (`lg:grid-cols-2 lg:grid-rows-2` with `minmax(0,1fr)` rows) is required for the single-screen constraint at all target resolutions. The donut chart's internal split (donut + table) keeps its own internal `gap`/padding since that is inside a widget, not between widgets.

6. **Compact the KPI cards and Savings Goal bar vertically.**
   `MetricCard` drops its `min-h-[132px]` and reduces vertical whitespace (`mt-5`→`mt-2`, `mt-4`→`mt-2`) while keeping `p-4` internal padding. The Savings Goal section loses its outer padded wrapper (the widget's own `p-4` remains). This frees vertical budget for charts on 1366x768.

## Risks / Trade-offs

- [Distribution table can exceed panel height with many categories] → The table region scrolls internally (`overflow-y-auto` inside the widget); the app container itself never scrolls, keeping the no-scroll policy while preserving data access.
- [Savings Goal edit form is taller than display mode] → Rows are `auto`-sized, so the chart row absorbs the difference; at 768px height the form still fits because charts have a 160px floor and can compress.
- [Very short viewports (<700px) cannot honor readability floors] → Minimum heights win over the no-scroll policy in pathological cases; accepted, target resolutions are 768px+ tall.
- [Existing tests may assert removed header text] → Update/remove those assertions as part of implementation.

## Open Questions

None — the request fully specifies scope (header removal, gapless layout, sidebar untouched, no-scroll on desktop viewports).
