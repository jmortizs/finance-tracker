# Design: hybrid-pdf-extraction

## Context

Statement ingestion (`backend/app/services/statement_ingestion.py`) currently extracts PDF text with `pypdf`'s `extract_text()`, which returns a linear token stream that destroys the columnar structure of transaction tables. The Pydantic-AI agent (`backend/app/services/statement_agent.py`) then guesses at column boundaries, producing misaligned or hallucinated amounts, dates, and balances. `pdfplumber==0.11.10` is already declared in `backend/pyproject.toml`.

## Goals / Non-Goals

**Goals:**
- Deterministic, layout-preserving text extraction with `pdfplumber` so the LLM receives visually aligned tabular text.
- A composite prompt that clearly delimits the statement payload and instructs the model to parse (not interpret) it.
- Distinct diagnostic errors for corrupted PDFs (400) and image-only scanned PDFs (422) raised before any LLM invocation.

**Non-Goals:**
- No changes to the upload endpoint, extraction schema (`StatementExtraction`), arithmetic validation, deduplication, or persistence logic.
- No OCR support for scanned PDFs; they are rejected with a clear diagnostic.
- No multi-model or retry orchestration changes.

## Decisions

1. **`pdfplumber` layout mode over table extraction APIs.** Use `page.extract_text(layout=True)` per page rather than `extract_tables()`. Layout mode reproduces the page as monospaced text with original spacing, which generalizes across heterogeneous bank statement formats; `extract_tables()` requires per-bank tuning of table-detection heuristics and fails silently on borderless tables. The LLM handles format variance; pdfplumber guarantees spatial fidelity.
2. **Page delimiters in the payload.** Join pages with explicit `--- PAGE n ---` markers so multi-page statements keep row context and the model never merges rows across page boundaries.
3. **Error taxonomy via existing exception hierarchy.** Add `CorruptedPdfError` (400) and `ScannedPdfError` (422) as `StatementIngestionError` subclasses, reusing the router's existing status-code propagation instead of introducing a new error-handling mechanism.
4. **Scanned-PDF detection = successful parse with zero extractable text.** A PDF that opens but yields no non-whitespace text on any page is classified as image-only. This is a deterministic check requiring no OCR dependency.
5. **Composite prompt in the ingestion service.** The service wraps the payload in `<statement_text>` delimiters with a short parsing directive; the agent's system instructions gain guidance about column-aligned text. Prompt construction stays in the service (orchestration concern), model behavior guidance stays in the agent factory.
6. **Drop the `pypdf` code path entirely.** The `_extract_pdf_text` helper switches to `pdfplumber`; no fallback to `pypdf` is kept, avoiding dual maintenance and nondeterministic behavior differences.

## Risks / Trade-offs

- [Layout mode inflates whitespace and token count] → Strip trailing whitespace per line and collapse fully blank line runs; statement PDFs are small (a few pages), so token cost stays negligible.
- [Some text-based PDFs embed fonts pdfplumber cannot decode, yielding empty text] → These are indistinguishable from scans and receive the 422 scanned-document diagnostic, which is still an accurate "no extractable text" message for the client.
- [Password-protected PDFs raise open errors] → Surfaced through the corrupted-PDF 400 path with the parse-failure diagnostic.

## Migration Plan

Single deploy; no schema or API contract changes. Rollback is a revert of the service/agent changes.
