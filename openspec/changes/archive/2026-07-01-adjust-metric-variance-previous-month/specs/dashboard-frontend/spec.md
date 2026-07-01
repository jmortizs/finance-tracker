## MODIFIED Requirements

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
