## MODIFIED Requirements

### Requirement: Dashboard metrics
The system SHALL display balance, income, expenses, net savings, and savings percentage from the backend metrics endpoint using financial color semantics.

#### Scenario: Metrics render from API response
- **WHEN** `/api/v1/dashboard/metrics` returns dashboard metrics
- **THEN** the system displays each metric value with its previous value or percentage change context
- **AND** the system does not display passive "live" or "success" labels on metric cards

#### Scenario: Expense and reduction values render in red
- **WHEN** the metrics response contains expense values or balance-reducing changes
- **THEN** the system displays expense-related values and unfavorable balance movement indicators in red

#### Scenario: Metrics loading state
- **WHEN** metrics are being requested
- **THEN** the system displays a loading state in the metrics header row without removing the dashboard frame

### Requirement: Analytical charts
The system SHALL render balance evolution, cash flow, and category distribution visualizations using backend chart endpoints with consistent financial color semantics.

#### Scenario: Balance evolution chart renders monthly closing balances
- **WHEN** `/api/v1/dashboard/charts/balance-evolution` returns monthly balance points
- **THEN** the system displays those points in a linear line chart as the final or closing balance for each month
- **AND** balance-reduction points or supporting indicators are displayed in red

#### Scenario: Cash flow chart renders three lines
- **WHEN** `/api/v1/dashboard/charts/cash-flow` returns monthly income, expense, and net savings points
- **THEN** the system displays income as a green linear line, expenses as a red linear line, and cash flow as a white linear line in a time-based chart

#### Scenario: Distribution charts render
- **WHEN** `/api/v1/dashboard/charts/distribution` returns income or expense category distribution rows
- **THEN** the system displays category amounts and percentages in distribution visualizations
- **AND** expense distribution data is displayed with red expense semantics where amounts or labels represent spending

### Requirement: API-backed state handling
The system SHALL provide clear loading, empty, and error states for API-backed dashboard regions without exposing passive success labels.

#### Scenario: Empty chart data
- **WHEN** a chart endpoint returns no rows for the selected filters
- **THEN** the system displays an empty state for that chart region

#### Scenario: API request failure
- **WHEN** an API request for a dashboard region fails
- **THEN** the system displays an error state for the affected region and preserves the rest of the dashboard where possible

#### Scenario: Loaded chart data does not show passive success label
- **WHEN** a chart endpoint returns data successfully
- **THEN** the system displays the chart content without a visible "success" status label in the chart panel header
