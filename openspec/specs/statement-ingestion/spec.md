# statement-ingestion Specification

## Purpose
TBD - created by archiving change ai-statement-ingestion. Update Purpose after archive.
## Requirements
### Requirement: Statement persistence schema
The system SHALL persist uploaded bank statement metadata in a `statements` table with an `id`, `bank_id` foreign key to `banks`, unique `file_hash`, original `file_name`, and `upload_date`. The system SHALL extend transactions with nullable `balance` and nullable issuer `bank_id` string fields, and SHALL NOT include a `previous_balance` transaction field.

#### Scenario: Schema supports statement tracking
- **WHEN** the database schema is initialized or synchronized
- **THEN** the `statements` table exists with a unique `file_hash`
- **AND** `statements.bank_id` references `banks.id`
- **AND** transactions include `balance` and `bank_id` columns
- **AND** transactions do not include a `previous_balance` column

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
The system SHALL use Pydantic-AI with an OpenAI model configured from environment settings to extract bank, account, and transaction data into a strict Pydantic output schema. The agent SHALL ingest layout-preserved text produced by the deterministic `pdfplumber` pre-processing stage and act as a parser of that spatial text rather than an interpreter of raw PDF content. The transaction extraction schema SHALL include current transaction `balance` context and SHALL NOT include `previous_balance`.

#### Scenario: Agent uses configured OpenAI model
- **WHEN** statement ingestion reaches the extraction step
- **THEN** the backend invokes a Pydantic-AI agent using the configured OpenAI model name
- **AND** the agent output is validated against the statement extraction schema before persistence
- **AND** extracted transactions are validated without a `previous_balance` field

#### Scenario: Agent parses layout-preserved text
- **WHEN** the extraction agent is invoked
- **THEN** its input is the layout-preserved text payload extracted by `pdfplumber`
- **AND** its instructions direct it to map tabular rows using the preserved column alignment

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
- **THEN** the system inserts the transaction with amount, type-derived category, `balance` context, issuer `bank_id`, date, and description

### Requirement: AI ingestion configuration documentation
The system SHALL document the OpenAI API key and statement extraction model environment variables in `.env.example` and README documentation.

#### Scenario: Configuration sample includes AI settings
- **WHEN** a developer inspects local environment examples
- **THEN** the sample configuration includes the OpenAI API key variable and model selection variable

### Requirement: Layout-preserving spatial text extraction
The system SHALL extract text from uploaded PDF bank statements using the `pdfplumber` library in layout mode, preserving the two-dimensional visual arrangement, spacing, and column alignment of tabular financial records across every page of the document.

#### Scenario: Tabular layout is preserved
- **WHEN** a text-based PDF bank statement is uploaded
- **THEN** the system extracts text page-by-page with `pdfplumber` using layout preservation
- **AND** column alignment and spacing of transaction tables are retained in the extracted text payload

### Requirement: Composite extraction prompt
The system SHALL construct a composite prompt for the extraction agent that embeds the layout-preserved text inside an explicitly delimited statement block and instructs the model to parse the pre-extracted spatial text without inventing values that are not present in the payload.

#### Scenario: Prompt wraps layout-preserved text
- **WHEN** statement ingestion reaches the extraction step
- **THEN** the agent receives a prompt containing the layout-preserved text within explicit delimiters
- **AND** the prompt instructs the model to rely on the column alignment of the provided text when mapping tabular rows

### Requirement: Degenerate PDF fault tolerance
The system SHALL detect corrupted or unparseable PDFs and image-only (scanned) PDFs before invoking the AI model, returning distinct diagnostic errors: HTTP 400 with a corruption diagnostic for unparseable files and HTTP 422 with a scanned-document diagnostic for PDFs that contain pages but no extractable text.

#### Scenario: Corrupted PDF is rejected
- **WHEN** the uploaded file cannot be opened or parsed as a PDF document
- **THEN** the system returns an HTTP 400 error indicating the file is corrupted or not a valid PDF
- **AND** the AI model is not invoked

#### Scenario: Image-only scanned PDF is rejected
- **WHEN** the uploaded PDF parses successfully but yields no extractable text on any page
- **THEN** the system returns an HTTP 422 error indicating the document appears to be a scanned or image-only PDF that requires a text-based statement
- **AND** the AI model is not invoked

