# savings-goal Specification

## Purpose
TBD - created by archiving change savings-goal-refactoring. Update Purpose after archive.
## Requirements
### Requirement: Single savings goal storage
The system SHALL store the savings goal as a single canonical record containing mandatory `target_amount`, `start_date`, and `end_date` fields.

#### Scenario: Goal configuration is persisted
- **WHEN** the savings goal is created or updated
- **THEN** the system persists exactly one canonical savings goal configuration
- **AND** the persisted configuration includes `target_amount`, `start_date`, and `end_date`

#### Scenario: Goal fields are mandatory
- **WHEN** a savings goal write request omits `target_amount`, `start_date`, or `end_date`
- **THEN** the system rejects the request with validation feedback

### Requirement: Dynamic savings goal progress
The system SHALL calculate savings goal progress dynamically as total income minus total expenses for transactions incurred within the goal's `start_date` through `end_date` date range.

#### Scenario: Progress uses goal date range totals
- **WHEN** the goal date range contains income of 2500.00 and expenses of 900.00
- **THEN** the system reports progress as 1600.00

#### Scenario: Progress ignores transactions outside the goal date range
- **WHEN** transactions exist before `start_date` or after `end_date`
- **THEN** the system excludes those transactions from savings goal progress

### Requirement: Savings goal completion percentage
The system SHALL calculate completion percentage as `progress / target_amount * 100` using the dynamically calculated progress and configured target amount.

#### Scenario: Completion percentage is calculated
- **WHEN** the savings goal target amount is 2000.00 and calculated progress is 500.00
- **THEN** the system reports completion percentage as 25.00

#### Scenario: Zero target does not break response
- **WHEN** the savings goal target amount is 0.00
- **THEN** the system returns a completion percentage of 0.00

### Requirement: Savings goal API management
The system SHALL expose `/api/v1/savings-goal` endpoints to read and update the single savings goal configuration and calculated progress.

#### Scenario: Read savings goal
- **WHEN** the dashboard requests the savings goal
- **THEN** the system returns the goal configuration, calculated progress, completion percentage, and deadline

#### Scenario: Update savings goal inline data
- **WHEN** the dashboard submits updated `target_amount`, `start_date`, and `end_date`
- **THEN** the system updates the single savings goal record
- **AND** the response includes recalculated progress and completion percentage
