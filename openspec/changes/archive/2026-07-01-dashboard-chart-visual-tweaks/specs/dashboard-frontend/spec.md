## MODIFIED Requirements

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
