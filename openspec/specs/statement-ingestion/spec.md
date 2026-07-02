# statement-ingestion Specification

## Purpose
TBD - created by archiving change ai-statement-ingestion. Update Purpose after archive.
## Requirements
### Requirement: Statement persistence schema
The system SHALL persist uploaded bank statement metadata in a `statements` table with an `id`, `bank_id` foreign key to `banks`, unique `file_hash`, original `file_name`, and `upload_date`. The system SHALL extend transactions with nullable `previous_balance`, nullable `balance`, and nullable issuer `bank_id` string fields.

#### Scenario: Schema supports statement tracking
- **WHEN** the database schema is initialized or synchronized
- **THEN** the `statements` table exists with a unique `file_hash`
- **AND** `statements.bank_id` references `banks.id`
- **AND** transactions include `previous_balance`, `balance`, and `bank_id` columns

### Requirement: PDF statement upload endpoint
The system SHALL expose a `/api/v1/statements/upload` POST endpoint that accepts exactly one PDF file upload and rejects non-PDF inputs.

#### Scenario: Upload accepts one PDF
- **WHEN** the user uploads a PDF file to `/api/v1/statements/upload`
- **THEN** the system processes that file as a bank statement ingestion request

#### Scenario: Upload rejects non-PDF file
- **WHEN** the user uploads a file whose content type or filename is not PDF-compatible
- **THEN** the system rejects the request without invoking AI extraction

### Requirement: Statement file de-duplication
The system SHALL compute a cryptographic hash of each uploaded PDF and reject processing when a statement with the same `file_hash` already exists.

#### Scenario: Duplicate PDF is rejected
- **WHEN** the uploaded PDF hash matches an existing statement record
- **THEN** the system returns a conflict error
- **AND** the system does not invoke the AI model
- **AND** the system does not insert transactions

### Requirement: Pydantic-AI extraction agent
The system SHALL use Pydantic-AI with an OpenAI model configured from environment settings to extract bank, account, and transaction data into a strict Pydantic output schema.

#### Scenario: Agent uses configured OpenAI model
- **WHEN** statement ingestion reaches the extraction step
- **THEN** the backend invokes a Pydantic-AI agent using the configured OpenAI model name
- **AND** the agent output is validated against the statement extraction schema before persistence

### Requirement: AI database lookup tools
The statement extraction agent SHALL expose tools that can query existing categories, banks, and accounts so extracted transactions can be classified and mapped to system entities.

#### Scenario: Agent can inspect finance entities
- **WHEN** the AI agent needs category, bank, or account context
- **THEN** the agent can call tools that return the available categories, banks, and accounts from the database

### Requirement: Statement arithmetic validation
The extraction schema MUST fail validation unless the extracted balances satisfy `final_balance = initial_balance + total_income - total_expenses`.

#### Scenario: Balanced statement passes validation
- **WHEN** extracted totals satisfy the arithmetic equation
- **THEN** the extraction result is accepted for persistence

#### Scenario: Unbalanced statement fails validation
- **WHEN** extracted totals do not satisfy the arithmetic equation
- **THEN** the system rejects the ingestion before creating the statement record or transactions

### Requirement: Default transaction currency
The system SHALL record extracted transactions in Colombian Peso (`COP`) unless the uploaded statement explicitly defines another currency.

#### Scenario: Currency omitted by statement
- **WHEN** the extracted statement does not explicitly provide a currency
- **THEN** transactions and account context default to `COP`

#### Scenario: Currency provided by statement
- **WHEN** the extracted statement explicitly provides a currency
- **THEN** the system uses the provided currency for the extracted account and transactions

### Requirement: Transaction duplicate prevention
The system SHALL avoid inserting duplicate transactions when an existing row has the same `account_id`, issuer `bank_id`, and `transaction_date`.

#### Scenario: Duplicate transaction is skipped
- **WHEN** an extracted transaction matches an existing transaction by `account_id`, issuer `bank_id`, and `transaction_date`
- **THEN** the system skips inserting that transaction
- **AND** the ingestion response reports it as skipped

#### Scenario: New transaction is inserted
- **WHEN** an extracted transaction does not match an existing composite duplicate
- **THEN** the system inserts the transaction with amount, type-derived category, balance context, issuer `bank_id`, date, and description

### Requirement: AI ingestion configuration documentation
The system SHALL document the OpenAI API key and statement extraction model environment variables in `.env.example` and README documentation.

#### Scenario: Configuration sample includes AI settings
- **WHEN** a developer inspects local environment examples
- **THEN** the sample configuration includes the OpenAI API key variable and model selection variable

