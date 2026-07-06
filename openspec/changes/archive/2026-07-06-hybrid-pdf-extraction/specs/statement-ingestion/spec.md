# statement-ingestion Delta Specification

## ADDED Requirements

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

## MODIFIED Requirements

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
