## MODIFIED Requirements

### Requirement: Dashboard metrics
The system SHALL display balance, income, expenses, and net savings in the top dashboard metric row using financial color semantics. The backend metrics endpoint SHALL provide previous value and percentage change context calculated relative to the immediately previous calendar month rather than an equally long previous date range. The visible top metric row SHALL NOT display the deprecated `Savings %` KPI card.

#### Scenario: Metrics render from API response
- **WHEN** `/api/v1/dashboard/metrics` returns dashboard metrics
- **THEN** the system displays balance, income, expenses, and net savings with each metric value and previous value or percentage change context
- **AND** the system does not display the `Savings %` KPI card in the top metric row
- **AND** the system does not display passive "live" or "success" labels on metric cards

#### Scenario: Metrics use previous month variance baseline
- **WHEN** the user requests dashboard metrics for the date range 2025-01-01 through 2026-06-30
- **THEN** the balance percentage change is calculated from the difference between the closing balance as of 2026-06-30 and the closing balance as of 2026-05-31
- **AND** every visible metric with previous value or percentage change context uses the immediately previous calendar month as its baseline

#### Scenario: Expense and reduction values render in red
- **WHEN** the metrics response contains expense values or balance-reducing changes
- **THEN** the system displays expense-related values and unfavorable balance movement indicators in red

#### Scenario: Metrics loading state
- **WHEN** metrics are being requested
- **THEN** the system displays a loading state in the metrics header row without removing the dashboard frame

### Requirement: Dashboard savings goal card
The system SHALL display the savings goal card in the far-right slot of the top dashboard grid with target amount, current completion percentage, progress amount, and goal deadline.

#### Scenario: Savings goal card renders configured goal in top grid
- **WHEN** `/api/v1/savings-goal` returns a configured savings goal
- **THEN** the far-right top dashboard grid slot displays the savings goal card
- **AND** the card displays the target goal amount
- **AND** the card displays the current completion percentage
- **AND** the card displays the progress amount
- **AND** the card displays the goal deadline from `end_date`

#### Scenario: Savings goal card renders setup state in top grid
- **WHEN** `/api/v1/savings-goal` returns no configured savings goal
- **THEN** the far-right top dashboard grid slot displays a savings goal card that allows the user to enter target amount, start date, and end date
