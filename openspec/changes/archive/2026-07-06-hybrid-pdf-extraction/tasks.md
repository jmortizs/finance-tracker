# Tasks: hybrid-pdf-extraction

## 1. Dependency & Extraction Stage

- [x] 1.1 Sync the `pdfplumber==0.11.10` dependency into the backend environment with `uv sync` and confirm it imports.
- [x] 1.2 Replace the `pypdf`-based `_extract_pdf_text` in `backend/app/services/statement_ingestion.py` with a `pdfplumber` layout-mode extractor that processes every page with `extract_text(layout=True)`, strips trailing whitespace, collapses blank-line runs, and joins pages with `--- PAGE n ---` delimiters.

## 2. Fault Tolerance

- [x] 2.1 Add `CorruptedPdfError` (status 400) and `ScannedPdfError` (status 422) subclasses of `StatementIngestionError` and raise them from the extraction stage: corruption diagnostics when the PDF cannot be opened/parsed, scanned-document diagnostics when parsing succeeds but no page yields extractable text. Both must occur before any LLM invocation.

## 3. Prompt Orchestration

- [x] 3.1 Build the composite prompt in `_extract_statement`: wrap the layout-preserved payload in `<statement_text>` delimiters with a directive to parse the pre-extracted spatial text and never invent values absent from the payload.
- [x] 3.2 Update the agent instructions in `backend/app/services/statement_agent.py` to state the input is layout-preserved text from a deterministic PDF pre-processor and that tabular rows must be mapped using the preserved column alignment.

## 4. Tests & Verification

- [x] 4.1 Extend `backend/tests/test_statement_ingestion.py` with coverage for: layout-preserving extraction of a real text PDF, corrupted-PDF rejection (400), and scanned/image-only PDF rejection (422) — asserting the AI model is never invoked on the error paths.
- [x] 4.2 Run `ruff check app`, `ruff format app`, `mypy app`, and `uv run pytest`; validate extraction output against the sample statements in `statements/` and fix any failures.

## 5. Documentation

- [x] 5.1 Update `README.md` if it references the PDF parsing approach or error behavior of statement ingestion.
