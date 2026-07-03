## MODIFIED Requirements

### Requirement: Dashboard metrics
The system SHALL display balance, income, expenses, and net savings in the top metrics header row using financial color semantics. The backend metrics endpoint SHALL calculate current and previous balance values from the latest non-null `transactions.balance` snapshots in the requested and previous calendar periods. The backend metrics endpoint SHALL continue to provide previous value and percentage change context calculated relative to the immediately previous calendar month rather than an equally long previous date range. The dashboard SHALL NOT display the savings percentage KPI card in the top metrics header row.

#### Scenario: Metrics render from API response
- **WHEN** `/api/v1/dashboard/metrics` returns dashboard metrics
- **THEN** the system displays balance, income, expenses, and net savings metric values with previous value or percentage change context
- **AND** the system does not display passive "live" or "success" labels on metric cards
- **AND** the system does not display a `Savings %` KPI card

#### Scenario: Metrics use previous month variance baseline
- **WHEN** the user requests dashboard metrics for the date range 2025-01-01 through 2026-06-30
- **THEN** the balance percentage change is calculated from the difference between the latest non-null transaction `balance` as of 2026-06-30 and the latest non-null transaction `balance` as of 2026-05-31
- **AND** every displayed metric with previous value or percentage change context uses the immediately previous calendar month as its baseline

#### Scenario: Expense and reduction values render in red
- **WHEN** the metrics response contains expense values or balance-reducing changes
- **THEN** the system displays expense-related values and unfavorable balance movement indicators in red

#### Scenario: Metrics loading state
- **WHEN** metrics are being requested
- **THEN** the system displays a loading state in the metrics header row without removing the dashboard frame

### Requirement: Analytical charts
The system SHALL render balance evolution, cash flow, and category distribution visualizations using backend chart endpoints with consistent financial color semantics, visible point-level markers for line-series charts, and legible hover details for donut segments. The balance evolution endpoint SHALL calculate monthly closing balances from the latest non-null `transactions.balance` snapshot in each month.

#### Scenario: Balance evolution chart renders monthly closing balances
- **WHEN** `/api/v1/dashboard/charts/balance-evolution` returns monthly balance points
- **THEN** the system displays those points in a linear line chart as the latest non-null transaction `balance` for each month
- **AND** each point is visually identifiable as a circular datapoint marker
- **AND** balance-reduction points or supporting indicators are displayed in red

#### Scenario: Cash flow chart renders with datapoint markers
- **WHEN** `/api/v1/dashboard/charts/cash-flow` returns monthly income, expense, and net savings points
- **THEN** the system displays income as a green linear line, expenses as a red linear line, and cash flow as a white linear line in a time-based chart
- **AND** each monthly point on all cash flow series is rendered with a circular marker

#### Scenario: Distribution charts render with financial palette ordering
- **WHEN** `/api/v1/dashboard/charts/distribution` returns income or expense category distribution rows
- **THEN** the system displays category amounts and percentages in distribution visualizations
- **AND** the income distribution palette starts with a primary green slice for the first rendered category
- **AND** expense distribution data is displayed with red expense semantics where amounts or labels represent spending

#### Scenario: Donut segment hover content is legible
- **WHEN** the user hovers a segment in either distribution donut chart
- **THEN** the system displays a non-empty tooltip that includes category identity and value context
- **AND** tooltip text and background maintain readable contrast against the dashboard theme
