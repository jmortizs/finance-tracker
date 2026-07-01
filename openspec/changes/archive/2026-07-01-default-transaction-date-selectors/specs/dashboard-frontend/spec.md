## MODIFIED Requirements

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
