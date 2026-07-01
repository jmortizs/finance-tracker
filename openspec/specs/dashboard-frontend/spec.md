## Purpose

Define the local read-only frontend dashboard experience for the personal finance tracker.
## Requirements
### Requirement: Dashboard application shell
The system SHALL provide a local frontend dashboard application with a global control sidebar, metrics header row, and primary analytical visualization canvas.

#### Scenario: Dashboard loads application frame
- **WHEN** the user opens the frontend application
- **THEN** the system displays the dashboard frame with filter controls, metric regions, and chart regions without requiring authentication

### Requirement: Global dashboard filters
The system SHALL let the user filter dashboard analytics by date range, bank, and account using options returned by the backend filter endpoint. The frontend date range controls SHALL default to the oldest and most recent `transaction_date` values recorded in the transactions table when those bounds are available.

#### Scenario: Filter options populate controls
- **WHEN** the frontend receives filter options from `/api/v1/filters/options`
- **THEN** the system displays available banks and accounts in the global filter controls

#### Scenario: Filter options initialize date controls
- **WHEN** the frontend receives filter options that include an oldest transaction date and a most recent transaction date
- **THEN** the start date control defaults to the oldest transaction date
- **AND** the end date control defaults to the most recent transaction date

#### Scenario: Empty transaction date bounds leave date controls empty
- **WHEN** the frontend receives filter options without transaction date bounds
- **THEN** the start date and end date controls remain empty

#### Scenario: Filters update dashboard data
- **WHEN** the user changes the date range, bank, or account filter
- **THEN** the system requests dashboard data using the selected filter query parameters for endpoints that support those parameters

#### Scenario: Reset restores data-driven date defaults
- **WHEN** the user resets dashboard filters after transaction date bounds have loaded
- **THEN** the start date control is restored to the oldest transaction date
- **AND** the end date control is restored to the most recent transaction date
- **AND** bank and account filters are restored to their unselected state

#### Scenario: Bank filter constrains accounts
- **WHEN** the user selects a bank
- **THEN** the system limits account choices to accounts associated with the selected bank and clears any incompatible account selection

### Requirement: Dashboard metrics
The system SHALL display balance, income, expenses, net savings, and savings percentage from the backend metrics endpoint using financial color semantics. The backend metrics endpoint SHALL provide previous value and percentage change context calculated relative to the immediately previous calendar month rather than an equally long previous date range.

#### Scenario: Metrics render from API response
- **WHEN** `/api/v1/dashboard/metrics` returns dashboard metrics
- **THEN** the system displays each metric value with its previous value or percentage change context
- **AND** the system does not display passive "live" or "success" labels on metric cards

#### Scenario: Metrics use previous month variance baseline
- **WHEN** the user requests dashboard metrics for the date range 2025-01-01 through 2026-06-30
- **THEN** the balance percentage change is calculated from the difference between the closing balance as of 2026-06-30 and the closing balance as of 2026-05-31
- **AND** every metric with previous value or percentage change context uses the immediately previous calendar month as its baseline

#### Scenario: Expense and reduction values render in red
- **WHEN** the metrics response contains expense values or balance-reducing changes
- **THEN** the system displays expense-related values and unfavorable balance movement indicators in red

#### Scenario: Metrics loading state
- **WHEN** metrics are being requested
- **THEN** the system displays a loading state in the metrics header row without removing the dashboard frame

### Requirement: Analytical charts
The system SHALL render balance evolution, cash flow, and category distribution visualizations using backend chart endpoints with consistent financial color semantics, visible point-level markers for line-series charts, and legible hover details for donut segments.

#### Scenario: Balance evolution chart renders monthly closing balances
- **WHEN** `/api/v1/dashboard/charts/balance-evolution` returns monthly balance points
- **THEN** the system displays those points in a linear line chart as the final or closing balance for each month
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

### Requirement: Local Docker development
The system SHALL run the frontend through local Docker orchestration alongside the existing backend and database services.

#### Scenario: Frontend service starts with compose
- **WHEN** the user starts the project with Docker Compose
- **THEN** the frontend service becomes available on a documented local port and can reach the backend analytics API

### Requirement: Frontend verification
The system SHALL include frontend verification commands for linting, testing, and production build validation.

#### Scenario: Frontend checks pass
- **WHEN** the frontend lint, test, and build commands are executed
- **THEN** each command completes successfully for the dashboard MVP
