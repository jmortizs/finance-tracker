## 1. Backend Data Model And API

- [x] 1.1 Refactor the `SavingsGoal` ORM model to mandatory `target_amount`, `start_date`, and `end_date` fields.
- [x] 1.2 Add Pydantic schemas for savings goal read and update payloads, including calculated progress and completion percentage.
- [x] 1.3 Add repository methods to get, upsert, and calculate transaction totals for the single savings goal without global filters.
- [x] 1.4 Add service logic to read/update the single goal and dynamically calculate progress and completion percentage.
- [x] 1.5 Add `/api/v1/savings-goal` GET and PUT endpoints.

## 2. Frontend Dashboard Card

- [x] 2.1 Add frontend API types and client functions for reading and updating the savings goal.
- [x] 2.2 Extend dashboard state management to load savings goal data independently from global dashboard filters.
- [x] 2.3 Add a savings goal dashboard card that displays target amount, completion percentage, and deadline.
- [x] 2.4 Implement inline editing for target amount, start date, and end date within the card.

## 3. Verification

- [x] 3.1 Add backend tests for single-record storage, dynamic progress calculation, date range isolation, and update behavior.
- [x] 3.2 Add frontend tests for API query isolation, savings goal rendering, and inline update behavior.
- [x] 3.3 Run backend lint/tests and frontend lint/tests/build for modified areas.
- [x] 3.4 Update README documentation if user-facing commands or behavior changed.
