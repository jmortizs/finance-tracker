# credit-card-tracking Specification

## Purpose

Define the independent local credit-card statement ingestion and dashboard experience.

## Requirements

### Requirement: Independent credit-card persistence
The system SHALL persist credit cards, their uploaded statement metadata, and statement items in dedicated storage that is separate from existing bank accounts, statements, categories, and transactions. A credit card SHALL retain its issuer, masked account number, currency, and credit limit. A statement SHALL retain its source hash, statement date, current balance, APR, and credit limit snapshot. A statement item SHALL retain its date, description, fixed category, item kind, signed amount, installment position, installment total, and remaining amount.

#### Scenario: Credit-card data is stored independently
- **WHEN** a credit-card statement is successfully ingested
- **THEN** the system creates or reuses only credit-card records and persists the statement and its items in credit-card storage
- **AND** the system does not create or modify bank-account statements or cash transactions

### Requirement: Hybrid credit-card statement ingestion
The system SHALL expose `POST /api/v1/credit-cards/statements/upload` for one PDF credit-card statement. It SHALL calculate a SHA-256 hash and reject a duplicate before extraction. It SHALL use embedded layout-preserved text when present and local OCR for pages without extractable text, then use an AI parser to validate and structure the normalized content.

#### Scenario: Text statement is extracted without OCR
- **WHEN** an uploaded credit-card PDF has extractable page text
- **THEN** the system preserves the page layout in the parser payload
- **AND** the system sends the normalized text to the AI parser

#### Scenario: Scanned statement is extracted with OCR
- **WHEN** an uploaded credit-card PDF has a page without extractable text
- **THEN** the system renders that page locally and obtains OCR text before invoking the AI parser
- **AND** the parser payload identifies the page boundary

#### Scenario: Duplicate credit-card statement is rejected
- **WHEN** the uploaded PDF hash matches a prior credit-card statement
- **THEN** the system returns a conflict response without invoking extraction or inserting records

### Requirement: Fixed AI categories and item classification
The credit-card extraction system SHALL classify every statement item as `purchase`, `payment`, or `interest` and assign exactly one category from `groceries`, `dining and delivery`, `fitness`, `fuel`, `clothing`, `subscriptions`, `insurance`, and `others`, based on its description. Purchases and interest SHALL be stored as positive amounts, while credit-card payments SHALL be stored as negative amounts.

#### Scenario: Purchases receive an allowed category
- **WHEN** the AI parser extracts a purchase description
- **THEN** the item category is one of the fixed allowed categories
- **AND** the item amount is positive

#### Scenario: Credit-card payments use credit semantics
- **WHEN** the AI parser extracts a payment or account credit
- **THEN** the item kind is `payment`
- **AND** the item amount is negative
- **AND** the item is assigned an allowed category

### Requirement: Credit-card analytics API
The system SHALL expose independent credit-card analytics endpoints returning current card metrics, monthly activity, category distribution, and statement items. The metrics response SHALL contain current statement balance, credit utilization, available credit, weighted APR, and active installment-plan count. Monthly activity SHALL separately aggregate purchase spending, payment credits, and interest charges. Category distribution SHALL represent purchase spending only.

#### Scenario: Latest statements produce credit metrics
- **WHEN** one or more credit cards have uploaded statements
- **THEN** the metrics endpoint reports the sum of their latest statement balances
- **AND** credit utilization equals current balance divided by total latest credit limits
- **AND** available credit equals total latest credit limits minus current balance
- **AND** weighted APR uses latest APR values weighted by positive latest balances

#### Scenario: Monthly activity separates financial item kinds
- **WHEN** statement items include purchases, payments, and interest across months
- **THEN** the monthly activity endpoint returns separate monthly spending, payment, and interest totals
- **AND** payment totals retain negative credit semantics

#### Scenario: Category distribution excludes payments and interest
- **WHEN** the system returns category distribution data
- **THEN** it includes purchase items only
- **AND** each returned category is from the fixed allowed category set

### Requirement: Credit-card dashboard page
The frontend SHALL provide a dedicated, responsive credit-card page reachable from the dashboard without changing existing cash-dashboard behavior. The page SHALL include a credit-card statement upload control, the five requested metrics, side-by-side monthly activity and category-distribution charts, and a statement-item table with Date, Description, Category, Installments, Amount, and Remaining columns. Expense amounts SHALL render red and payment amounts SHALL render green.

#### Scenario: Credit-card page renders analytics
- **WHEN** the user opens the credit-card page and analytics data is available
- **THEN** the page displays current statement balance, utilization with available credit, weighted APR, and active plans
- **AND** it displays monthly spending, payments, and interest alongside purchase category distribution

#### Scenario: Statement table communicates obligations
- **WHEN** statement items include installment data
- **THEN** the table displays the installment as current position and total such as `2/24`
- **AND** it displays the remaining amount for the item
- **AND** payments render in green while expenses and interest render in red

#### Scenario: Existing dashboard remains independent
- **WHEN** the user switches between the existing dashboard and the credit-card page
- **THEN** existing cash-dashboard filters and analytics retain their behavior
- **AND** credit-card data is not included in cash-dashboard metrics or charts
