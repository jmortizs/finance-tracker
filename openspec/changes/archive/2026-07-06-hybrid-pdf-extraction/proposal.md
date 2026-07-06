# Proposal: hybrid-pdf-extraction

## Why

Statement ingestion currently flattens PDF text with `pypdf`, which discards the spatial arrangement of tabular data. The LLM then receives a stream of unaligned tokens and frequently misaligns columns or hallucinates transaction values, corrupting financial data integrity. A deterministic, layout-preserving pre-processing stage removes this ambiguity before the LLM parses the statement.

## What Changes

- Replace `pypdf` text extraction with `pdfplumber` (already added as a dependency), extracting text page-by-page while preserving the two-dimensional layout — spacing and column alignment — of tabular financial records.
- Construct a composite extraction prompt that wraps the layout-preserved text and instructs the LLM to act as a parser of the pre-extracted structured text rather than an interpreter of raw PDF content.
- Add robust fault tolerance for degenerate inputs: corrupted/unparseable PDFs and image-only (scanned) PDFs return clear, distinct diagnostic errors instead of generic failures.
- Keep the existing ingestion endpoint (`/api/v1/statements/upload`), extraction schema, and schema validation untouched.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `statement-ingestion`: The PDF text extraction requirement changes from plain sequential text extraction to layout-preserving spatial extraction via `pdfplumber`, and fault tolerance requirements are added for corrupted and image-only (scanned) PDFs with distinct diagnostic error responses.

## Impact

- `backend/app/services/statement_ingestion.py`: swap `pypdf` extraction for `pdfplumber` layout-mode extraction; add scanned/corrupted PDF error paths.
- `backend/app/services/statement_agent.py`: adjust agent instructions to consume layout-preserved text.
- `backend/pyproject.toml` / `backend/uv.lock`: `pdfplumber==0.11.10` dependency (already staged); `pypdf` no longer used by ingestion.
- `backend/tests/test_statement_ingestion.py`: update/extend tests for layout extraction and new error paths.
- No API contract, database schema, or Pydantic output schema changes.
