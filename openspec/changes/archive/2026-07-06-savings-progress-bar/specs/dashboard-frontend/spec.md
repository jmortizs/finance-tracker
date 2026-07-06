## REMOVED Requirements

### Requirement: Dashboard savings goal card
**Reason**: The savings goal is no longer displayed as a metric-row card; it is replaced by a full-width progress bar below the metrics header row.
**Migration**: Use the dashboard savings progress bar requirement for savings goal visualization.

## ADDED Requirements

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

## MODIFIED Requirements

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
