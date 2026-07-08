## MODIFIED Requirements

### Requirement: Dashboard savings progress bar
The system SHALL display a compact savings progress bar directly below the top metrics header row. The configured-state component SHALL minimize its vertical footprint to preserve additional chart area below while retaining readable internal padding. The component SHALL display a "SAVINGS GOALS" header, an EDIT action, current accumulated savings on the left, target savings on the right, goal start date below the left bound, goal target date below the right bound, and a horizontal progress track with a dynamic percentage label. The progress track SHALL be visually narrow relative to the widget height, similar to a video progress bar, and SHALL include a circular marker at the current progress point with the percentage label positioned directly above the marker. Displayed savings goal money amounts SHALL use visible thousands separators consistent with other dashboard currency values.

#### Scenario: Savings progress bar renders configured goal
- **WHEN** `/api/v1/savings-goal` returns a configured savings goal with progress 200.00 and target amount 1000.00
- **THEN** the dashboard displays the savings progress bar immediately below the metrics header row
- **AND** the configured savings goal component uses compact vertical spacing that leaves more room for the chart grid below it than the previous full-height layout
- **AND** the dashboard displays the current accumulated savings amount on the left bound using visible currency thousands separators when applicable
- **AND** the dashboard displays the target savings amount on the right bound using visible currency thousands separators when applicable
- **AND** the dashboard displays the goal `start_date` below the left bound
- **AND** the dashboard displays the goal `end_date` below the right bound
- **AND** the dashboard displays a progress percentage calculated as `(progress / target_amount) * 100`
- **AND** the percentage label is positioned directly above a circular marker at the current progress point
- **AND** the progress track is rendered as a narrow horizontal bar rather than a tall block meter

#### Scenario: Zero progress renders empty track
- **WHEN** the savings goal progress equals 0
- **THEN** the progress track renders without a positive or negative fill
- **AND** the percentage label displays `0.0%`
- **AND** the circular marker sits at the start of the progress track

#### Scenario: Positive progress renders green fill
- **WHEN** the savings goal progress is greater than 0
- **THEN** the progress track fills left-to-right proportional to the calculated percentage
- **AND** the fill, circular marker, and percentage label use the standard positive UI color token

#### Scenario: Negative progress renders red fill
- **WHEN** the savings goal progress is less than 0
- **THEN** the progress track fills left-to-right proportional to the absolute calculated percentage
- **AND** the percentage label displays the negative value (for example `-20.0%`)
- **AND** the fill, circular marker, and percentage label use the standard danger UI color token

#### Scenario: Savings progress bar renders setup state
- **WHEN** `/api/v1/savings-goal` returns no configured savings goal
- **THEN** the dashboard displays the savings progress bar with editable controls for target amount, start date, and end date
