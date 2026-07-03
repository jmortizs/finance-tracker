## MODIFIED Requirements

### Requirement: Statement persistence schema
The system SHALL persist uploaded bank statement metadata in a `statements` table with an `id`, `bank_id` foreign key to `banks`, unique `file_hash`, original `file_name`, and `upload_date`. The system SHALL extend transactions with nullable `balance` and nullable issuer `bank_id` string fields, and SHALL NOT include a `previous_balance` transaction field.

#### Scenario: Schema supports statement tracking
- **WHEN** the database schema is initialized or synchronized
- **THEN** the `statements` table exists with a unique `file_hash`
- **AND** `statements.bank_id` references `banks.id`
- **AND** transactions include `balance` and `bank_id` columns
- **AND** transactions do not include a `previous_balance` column

### Requirement: Pydantic-AI extraction agent
The system SHALL use Pydantic-AI with an OpenAI model configured from environment settings to extract bank, account, and transaction data into a strict Pydantic output schema. The transaction extraction schema SHALL include current transaction `balance` context and SHALL NOT include `previous_balance`.

#### Scenario: Agent uses configured OpenAI model
- **WHEN** statement ingestion reaches the extraction step
- **THEN** the backend invokes a Pydantic-AI agent using the configured OpenAI model name
- **AND** the agent output is validated against the statement extraction schema before persistence
- **AND** extracted transactions are validated without a `previous_balance` field

### Requirement: Transaction duplicate prevention
The system SHALL avoid inserting duplicate transactions when an existing row has the same `account_id`, issuer `bank_id`, and `transaction_date`.

#### Scenario: Duplicate transaction is skipped
- **WHEN** an extracted transaction matches an existing transaction by `account_id`, issuer `bank_id`, and `transaction_date`
- **THEN** the system skips inserting that transaction
- **AND** the ingestion response reports it as skipped

#### Scenario: New transaction is inserted
- **WHEN** an extracted transaction does not match an existing composite duplicate
- **THEN** the system inserts the transaction with amount, type-derived category, `balance` context, issuer `bank_id`, date, and description
