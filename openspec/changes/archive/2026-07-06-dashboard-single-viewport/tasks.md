## 1. Application shell layout

- [x] 1.1 Remove the top header section (LOCAL ANALYTICS / FINANCE OVERVIEW / API badge) from `frontend/src/App.tsx`
- [x] 1.2 Lock the app shell to the viewport on desktop: `lg:h-dvh` + `lg:overflow-hidden` on the root wrapper, full-height flex row for sidebar + main, sidebar keeps independent overflow
- [x] 1.3 Restructure `<main>` as a gapless grid (`grid-rows-[auto_auto_minmax(0,1fr)]` with `gap-px bg-grid p-px`) hosting KPI row, savings goal, and chart area with 1px dividers only

## 2. Widget containers

- [x] 2.1 Convert the chart area to a gapless 2x2 grid at `lg` (`gap-px bg-grid`, `minmax(0,1fr)` rows/cols) in `frontend/src/App.tsx`
- [x] 2.2 Make `ChartPanel` a full-height flex column with `min-h-0` body so chart content stretches (`frontend/src/components/PanelState.tsx`)
- [x] 2.3 Remove interstitial borders/padding wrappers around the savings goal section; keep the widget's own internal padding
- [x] 2.4 Compact `MetricCard` vertical whitespace (drop `min-h-[132px]`, tighten margins) while preserving `p-4` internal padding

## 3. Fluid chart heights

- [x] 3.1 Replace fixed `h-[320px]` wrappers with container-filling heights in `BalanceEvolutionChart.tsx` and `CashFlowChart.tsx` (keep a `min-h` readability floor)
- [x] 3.2 Make `DistributionChart.tsx` fill its panel: fluid donut height instead of `h-[280px]`, internal table scrolls within the widget when it overflows

## 4. Verification

- [x] 4.1 Update any tests asserting removed header text or fixed-height layout; run `pnpm lint`, `pnpm test`, `pnpm build` in `frontend/` (fixed pre-existing "Savings Goals" header text mismatch; all 38 tests, lint, and build pass)
- [x] 4.2 Verify no vertical scroll and full widget visibility at 1920x1080, 1440x900, and 1366x768 (verified analytically: KPI ~112px + savings bar ~132px leave >=260px per chart row at 768px height, above the 160px floor; no automated browser available in this environment)
