## Why

The dashboard currently requires vertical scrolling to see all widgets: a decorative top header ("LOCAL ANALYTICS" / "FINANCE OVERVIEW" / "API /api/v1" badge) and interstitial gaps and padding between widget containers consume vertical space without conveying data. On standard desktop resolutions (1920x1080, 1440x900, 1366x768) the charts fall below the fold, defeating the purpose of an at-a-glance analytics view.

## What Changes

- **BREAKING** Remove the main-content top header section, including the "LOCAL ANALYTICS" label, the "FINANCE OVERVIEW" title, and the "API /api/v1" status indicator.
- Remove all interstitial spacing (gaps, margins, external padding) between the main dashboard widgets: KPI metric row, Savings Goal bar, Balance Evolution, Cash Flow, Income Distribution, and Expense Distribution panels. Adjacent widgets share `1px` grid-colored dividers instead of open gaps.
- Constrain the main application container to exactly one viewport height (`100dvh`) on desktop, with vertical scrolling disabled on the dashboard canvas.
- Make widget containers flex/grid-grow to dynamically fill reclaimed vertical space; chart plot areas switch from fixed pixel heights to fluid heights that track their container.
- Preserve the left-hand filter sidebar (date pickers, dropdowns, upload widget, action buttons) untouched in structure, styling, and behavior; the sidebar keeps its own independent scroll if its content exceeds the viewport.
- Preserve internal widget padding and chart axis readability; only spacing *between* widget bounds is eliminated.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard-frontend`: The "Dashboard application shell" requirement changes from a scrollable page with a metrics header row and top header to a gapless, single-viewport (no vertical scroll) layout without the top header section. Chart rendering requirements gain fluid-height behavior so visualizations resize with the viewport instead of using fixed pixel heights.

## Impact

- `frontend/src/App.tsx`: remove `<header>`, restructure `<main>` into a full-height, gapless grid/flex layout.
- `frontend/src/components/PanelState.tsx` (`ChartPanel`): panels become full-height flex columns so chart bodies stretch.
- `frontend/src/components/charts/BalanceEvolutionChart.tsx`, `CashFlowChart.tsx`, `DistributionChart.tsx`: replace fixed heights (`h-[320px]`, `h-[280px]`) with fluid, container-filling heights.
- `frontend/src/components/MetricCard.tsx`, `SavingsProgressBar.tsx`: minor container sizing adjustments only (internal padding preserved).
- `frontend/src/index.css`: viewport height / overflow rules for the app shell.
- `frontend/src/components/FilterSidebar.tsx`: no changes.
- No backend, API, or dependency changes. Existing tests referencing removed header text (if any) must be updated.
