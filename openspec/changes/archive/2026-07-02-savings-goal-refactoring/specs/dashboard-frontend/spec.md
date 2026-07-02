## ADDED Requirements

### Requirement: Dashboard savings goal card
The system SHALL display a savings goal card on the main dashboard with target amount, current completion percentage, and goal deadline.

#### Scenario: Savings goal card renders configured goal
- **WHEN** `/api/v1/savings-goal` returns a configured savings goal
- **THEN** the dashboard displays the target goal amount
- **AND** the dashboard displays the current completion percentage
- **AND** the dashboard displays the goal deadline from `end_date`

#### Scenario: Savings goal card renders setup state
- **WHEN** `/api/v1/savings-goal` returns no configured savings goal
- **THEN** the dashboard displays a savings goal card that allows the user to enter target amount, start date, and end date

### Requirement: Savings goal filter isolation
The dashboard savings goal card SHALL ignore global dashboard date, bank, and account filters and SHALL use only the goal's own configured date range for progress.

#### Scenario: Global date filters do not affect goal card request
- **WHEN** the user changes global dashboard date filters
- **THEN** the savings goal card does not send those global date filters to the savings goal API

#### Scenario: Goal progress remains tied to goal dates
- **WHEN** global dashboard filters differ from the savings goal `start_date` and `end_date`
- **THEN** the savings goal card displays progress calculated for the savings goal date range

### Requirement: Inline savings goal editing
The dashboard SHALL let users edit and save the savings goal `target_amount`, `start_date`, and `end_date` directly within the savings goal card without page redirection.

#### Scenario: User edits savings goal fields inline
- **WHEN** the user activates edit mode on the savings goal card
- **THEN** the card displays editable controls for target amount, start date, and end date

#### Scenario: User saves inline edits
- **WHEN** the user submits edited savings goal values from the card
- **THEN** the dashboard sends the updated values to `/api/v1/savings-goal`
- **AND** the dashboard refreshes the card with the saved goal and recalculated progress without navigating away
