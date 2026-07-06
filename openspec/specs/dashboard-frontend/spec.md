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
The system SHALL render balance evolution, cash flow, and category distribution visualizations using backend chart endpoints with consistent financial color semantics, visible point-level markers for line-series charts, and legible hover details for donut segments. The balance evolution endpoint SHALL calculate monthly closing balances by summing each filtered account's latest known non-null `transactions.balance` as of each month end.

#### Scenario: Balance evolution chart renders monthly closing balances
- **WHEN** `/api/v1/dashboard/charts/balance-evolution` returns monthly balance points
- **THEN** the system displays those points in a linear line chart as the summed month-end closing balance across filtered accounts, carrying forward each account's latest known non-null transaction `balance`
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

### Requirement: Dashboard savings progress bar
The system SHALL display a savings progress bar directly below the top metrics header row. The component SHALL display a "SAVINGS GOALS" header, an EDIT action, current accumulated savings on the left, target savings on the right, goal start date below the left bound, goal target date below the right bound, and a horizontal progress track with a dynamic percentage label.

#### Scenario: Savings progress bar renders configured goal
- **WHEN** `/api/v1/savings-goal` returns a configured savings goal with progress 200.00 and target amount 1000.00
- **THEN** the dashboard displays the savings progress bar immediately below the metrics header row
- **AND** the dashboard displays the current accumulated savings amount on the left bound
- **AND** the dashboard displays the target savings amount on the right bound
- **AND** the dashboard displays the goal `start_date` below the left bound
- **AND** the dashboard displays the goal `end_date` below the right bound
- **AND** the dashboard displays a progress percentage calculated as `(progress / target_amount) * 100`

#### Scenario: Zero progress renders empty track
- **WHEN** the savings goal progress equals 0
- **THEN** the progress track renders without a positive or negative fill
- **AND** the percentage label displays `0.0%`

#### Scenario: Positive progress renders green fill
- **WHEN** the savings goal progress is greater than 0
- **THEN** the progress track fills left-to-right proportional to the calculated percentage
- **AND** the fill and percentage label use the standard positive UI color token

#### Scenario: Negative progress renders red fill
- **WHEN** the savings goal progress is less than 0
- **THEN** the progress track fills left-to-right proportional to the absolute calculated percentage
- **AND** the percentage label displays the negative value (for example `-20.0%`)
- **AND** the fill and percentage label use the standard danger UI color token

#### Scenario: Savings progress bar renders setup state
- **WHEN** `/api/v1/savings-goal` returns no configured savings goal
- **THEN** the dashboard displays the savings progress bar with editable controls for target amount, start date, and end date

### Requirement: Savings goal filter isolation
The dashboard savings goal progress bar SHALL ignore global dashboard date, bank, and account filters and SHALL use only the goal's own configured date range for progress.

#### Scenario: Global date filters do not affect goal request
- **WHEN** the user changes global dashboard date filters
- **THEN** the savings goal progress bar does not send those global date filters to the savings goal API

#### Scenario: Goal progress remains tied to goal dates
- **WHEN** global dashboard filters differ from the savings goal `start_date` and `end_date`
- **THEN** the savings goal progress bar displays progress calculated for the savings goal date range

### Requirement: Inline savings goal editing
The dashboard SHALL let users edit and save the savings goal `target_amount`, `start_date`, and `end_date` directly within the savings goal progress bar without page redirection.

#### Scenario: User edits savings goal fields inline
- **WHEN** the user activates edit mode on the savings goal progress bar
- **THEN** the component displays editable controls for target amount, start date, and end date

#### Scenario: User saves inline edits
- **WHEN** the user submits edited savings goal values from the progress bar
- **THEN** the dashboard sends the updated values to `/api/v1/savings-goal`
- **AND** the dashboard refreshes the progress bar with the saved goal and recalculated progress without navigating away

### Requirement: Sidebar statement upload widget
The dashboard sidebar SHALL display a single-file PDF statement upload widget above the existing Refresh and Reset action buttons.

#### Scenario: Upload widget renders above dashboard actions
- **WHEN** the user opens the dashboard application
- **THEN** the sidebar displays a statement PDF upload container before the Refresh and Reset buttons
- **AND** the upload control accepts one PDF file at a time

#### Scenario: Uploaded statement refreshes dashboard data
- **WHEN** the user uploads a valid bank statement PDF from the sidebar widget
- **THEN** the frontend sends the file to `/api/v1/statements/upload`
- **AND** successful ingestion triggers a dashboard refresh
- **AND** the user sees an ingestion status message

#### Scenario: Upload failure is visible
- **WHEN** statement upload fails because of duplicate content, validation failure, configuration error, or API failure
- **THEN** the sidebar displays an error message without clearing the dashboard frame

