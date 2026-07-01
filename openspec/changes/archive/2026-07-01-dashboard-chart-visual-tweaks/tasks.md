## 1. Cash Flow Marker Consistency

- [x] 1.1 Identify the shared chart configuration path for balance and cash flow line series and confirm the marker settings used by balance evolution.
- [x] 1.2 Update cash flow line traces to render circular datapoint markers for income, expense, and net savings without regressing responsive behavior.

## 2. Donut Palette and Tooltip Fixes

- [x] 2.1 Implement deterministic income donut color ordering so the first rendered segment uses the primary green income color.
- [x] 2.2 Add explicit donut tooltip content and contrast-safe styling to prevent blank or unreadable hover labels in the dashboard theme.

## 3. Validation and Regression Coverage

- [x] 3.1 Add or update frontend chart tests (or config-level assertions) for cash flow markers, income palette ordering, and non-empty donut tooltip rendering.
- [x] 3.2 Run frontend verification commands and confirm lint/test/build pass with the new chart behavior.
