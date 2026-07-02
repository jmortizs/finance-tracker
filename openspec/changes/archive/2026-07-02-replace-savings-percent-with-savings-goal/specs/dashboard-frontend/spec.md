## MODIFIED Requirements

### Requirement: Dashboard metrics
The system SHALL display balance, income, expenses, and net savings in the top metrics header row using financial color semantics. The backend metrics endpoint SHALL continue to provide previous value and percentage change context calculated relative to the immediately previous calendar month rather than an equally long previous date range. The dashboard SHALL NOT display the savings percentage KPI card in the top metrics header row.

#### Scenario: Metrics render from API response
- **WHEN** `/api/v1/dashboard/metrics` returns dashboard metrics
- **THEN** the system displays balance, income, expenses, and net savings metric values with previous value or percentage change context
- **AND** the system does not display passive "live" or "success" labels on metric cards
- **AND** the system does not display a `Savings %` KPI card

#### Scenario: Metrics use previous month variance baseline
- **WHEN** the user requests dashboard metrics for the date range 2025-01-01 through 2026-06-30
- **THEN** the balance percentage change is calculated from the difference between the closing balance as of 2026-06-30 and the closing balance as of 2026-05-31
- **AND** every displayed metric with previous value or percentage change context uses the immediately previous calendar month as its baseline

#### Scenario: Expense and reduction values render in red
- **WHEN** the metrics response contains expense values or balance-reducing changes
- **THEN** the system displays expense-related values and unfavorable balance movement indicators in red

#### Scenario: Metrics loading state
- **WHEN** metrics are being requested
- **THEN** the system displays a loading state in the metrics header row without removing the dashboard frame

### Requirement: Dashboard savings goal card
The system SHALL display a savings goal card in the far-right slot of the main dashboard top metrics row with the same width, height, padding, and responsive grid constraints as the metric card it replaces. The card SHALL display target amount, current completion percentage, current progress amount, and goal deadline.

#### Scenario: Savings goal card renders configured goal in metric row
- **WHEN** `/api/v1/savings-goal` returns a configured savings goal
- **THEN** the dashboard displays the savings goal card in the far-right top metrics row position
- **AND** the dashboard displays the target goal amount
- **AND** the dashboard displays the current completion percentage
- **AND** the dashboard displays the current progress amount
- **AND** the dashboard displays the goal deadline from `end_date`

#### Scenario: Savings goal card renders setup state
- **WHEN** `/api/v1/savings-goal` returns no configured savings goal
- **THEN** the dashboard displays a savings goal card in the top metrics row that allows the user to enter target amount, start date, and end date
