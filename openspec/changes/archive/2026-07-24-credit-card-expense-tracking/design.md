## Context

The application currently stores only bank-account transactions and presents them in a single dashboard. Its statement pipeline uses layout-preserved PDF text and Pydantic-AI, but it intentionally rejects image-only PDFs and has no model for credit limits, statement balances, installment plans, card payments, or interest. Credit-card data must remain independent so it neither changes cash-account analytics nor is affected by the existing global dashboard filters.

## Goals / Non-Goals

**Goals:**
- Persist credit cards, uploaded statements, and statement items separately from existing finance records.
- Extract text statements deterministically and scanned statements through local OCR before sending one normalized payload to the AI parser.
- Provide a self-contained REST API and a navigable credit-card dashboard page with the requested metrics, charts, and table.
- Enforce the fixed category vocabulary and calculate payment, interest, utilization, available-credit, APR, and installment metrics deterministically.

**Non-Goals:**
- No changes to existing bank-statement ingestion, cash dashboard endpoints, global filters, or category records.
- No manual transaction editing, card management UI, payment scheduling, interest forecasting, authentication, or multi-user support.
- No cloud OCR service; OCR executes locally in the backend container.

## Decisions

1. **Use separate credit-card tables and endpoint namespace.** `credit_cards`, `credit_card_statements`, and `credit_card_statement_items` will model card-specific data and use `/api/v1/credit-cards/*` endpoints. This avoids overloading cash transactions and preserves the existing dashboard's semantics. Reusing `transactions` was rejected because installment, signed payment, interest, statement, card-limit, and APR fields do not belong to a cash-account transaction.
2. **Use pdfplumber text first, then local Tesseract OCR only for pages without text.** PDF text is cheaper and preserves layout for text-based statements. Rendering only textless pages with `pypdfium2` and passing the resulting image through `pytesseract` provides the requested hybrid OCR plus AI path without an external service. Sending images directly to a vision model was rejected because it would bypass deterministic local extraction and increase network dependence.
3. **Parse a strict card-statement schema with Pydantic-AI.** The agent returns card metadata, statement-level balance/limit/APR, and signed line items. A validator restricts categories to the required vocabulary and accepts only purchase, payment, and interest item kinds. Arithmetic and aggregation remain deterministic after extraction rather than being delegated to the model.
4. **Compute dashboard metrics from the most recent statement for each card.** Current statement balance, utilization, available credit, and weighted APR use the latest uploaded statement per card. Weighted APR weights each latest card APR by its positive balance; zero total balance produces zero APR. Active plans count items whose installment position is below its total, and remaining value is persisted as extracted or derived as the unpaid installment count times the installment amount.
5. **Keep the frontend page independent behind lightweight application navigation.** The existing dashboard remains its own rendered view. A separate credit-card view has its own upload, data fetching state, responsive grid, and no dependency on cash filters or dashboard hook. This is smaller than introducing a routing library for two local views.

## Risks / Trade-offs

- [Tesseract language data or executable is absent] -> Install `tesseract-ocr` in the backend Docker image and return a clear 422 error when neither embedded text nor OCR text is available.
- [AI misreads varying card statement formats] -> Use layout-preserving page delimiters, strict Pydantic validation, fixed categories, and API-level extraction tests with mocked output.
- [A statement does not declare a limit or APR] -> Preserve nullable source values; aggregate metrics treat missing values as zero and render an unavailable placeholder where necessary.
- [Re-uploading the same card statement] -> Reject by SHA-256 hash before extraction and persistence.
- [Large statement tables impact page layout] -> Place the table in an independently scrollable region while the metric and chart layout remains responsive.

## Migration Plan

1. Deploy the additive schema and database initialization synchronization.
2. Build the backend image with local OCR dependencies and deploy the new API and frontend page.
3. Existing finance tables, endpoints, dashboard, and uploaded bank statements remain untouched.
4. Roll back by reverting the feature code; the additive credit-card tables can remain unused without affecting existing behavior.

## Open Questions

None. Missing statement metadata is represented as unavailable rather than blocking ingestion.
