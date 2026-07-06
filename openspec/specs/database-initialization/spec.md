# database-initialization

Startup database setup for the Personal Finance Dashboard, including schema initialization and default data seeding.

## Requirements

### Requirement: Default categories are seeded on application initialization
The system SHALL attempt to populate the `categories` table with the following default rows on every application startup, after database schema initialization:

| name | type |
|------|------|
| ingresos | INCOME |
| egresos | EXPENSE |
| salario | INCOME |
| intereses | INCOME |
| pago tarjeta crédito | EXPENSE |
| seguros | EXPENSE |
| retiro de efectivo | EXPENSE |

#### Scenario: Fresh database receives default categories
- **WHEN** the application starts against an empty `categories` table
- **THEN** the system inserts all seven default categories with the specified names and types

#### Scenario: Existing categories are not duplicated
- **WHEN** the application starts and one or more default category names already exist in `categories`
- **THEN** the system skips inserts for those names and does not raise an error

#### Scenario: Seeding runs regardless of mock data setting
- **WHEN** the application starts with `seed_mock_data` disabled
- **THEN** the system still attempts to seed the default categories
