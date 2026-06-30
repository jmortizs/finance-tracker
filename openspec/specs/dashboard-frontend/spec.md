## Purpose

Define the local read-only frontend dashboard experience for the personal finance tracker.

## Requirements

### Requirement: Dashboard application shell
The system SHALL provide a local frontend dashboard application with a global control sidebar, metrics header row, and primary analytical visualization canvas.

#### Scenario: Dashboard loads application frame
- **WHEN** the user opens the frontend application
- **THEN** the system displays the dashboard frame with filter controls, metric regions, and chart regions without requiring authentication

### Requirement: Global dashboard filters
The system SHALL let the user filter dashboard analytics by date range, bank, and account using options returned by the backend filter endpoint.

#### Scenario: Filter options populate controls
- **WHEN** the frontend receives filter options from `/api/v1/filters/options`
- **THEN** the system displays available banks and accounts in the global filter controls

#### Scenario: Filters update dashboard data
- **WHEN** the user changes the date range, bank, or account filter
- **THEN** the system requests dashboard data using the selected filter query parameters for endpoints that support those parameters

#### Scenario: Bank filter constrains accounts
- **WHEN** the user selects a bank
- **THEN** the system limits account choices to accounts associated with the selected bank and clears any incompatible account selection

### Requirement: Dashboard metrics
The system SHALL display balance, income, expenses, net savings, and savings percentage from the backend metrics endpoint.

#### Scenario: Metrics render from API response
- **WHEN** `/api/v1/dashboard/metrics` returns dashboard metrics
- **THEN** the system displays each metric value with its previous value or percentage change context

#### Scenario: Metrics loading state
- **WHEN** metrics are being requested
- **THEN** the system displays a loading state in the metrics header row without removing the dashboard frame

### Requirement: Analytical charts
The system SHALL render balance evolution, cash flow, and category distribution visualizations using backend chart endpoints.

#### Scenario: Balance evolution chart renders
- **WHEN** `/api/v1/dashboard/charts/balance-evolution` returns monthly balance points
- **THEN** the system displays those points in a linear line chart

#### Scenario: Cash flow chart renders
- **WHEN** `/api/v1/dashboard/charts/cash-flow` returns monthly income, expense, and net savings points
- **THEN** the system displays income, expenses, and net savings in a time-based chart

#### Scenario: Distribution charts render
- **WHEN** `/api/v1/dashboard/charts/distribution` returns income or expense category distribution rows
- **THEN** the system displays category amounts and percentages in distribution visualizations

### Requirement: API-backed state handling
The system SHALL provide clear loading, empty, and error states for API-backed dashboard regions.

#### Scenario: Empty chart data
- **WHEN** a chart endpoint returns no rows for the selected filters
- **THEN** the system displays an empty state for that chart region

#### Scenario: API request failure
- **WHEN** an API request for a dashboard region fails
- **THEN** the system displays an error state for the affected region and preserves the rest of the dashboard where possible

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
