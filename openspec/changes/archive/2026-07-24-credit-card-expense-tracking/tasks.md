## 1. Credit-Card Backend Foundation

- [x] 1.1 Add credit-card, statement, and statement-item domain models with additive database initialization support.
- [x] 1.2 Add strict request/response schemas, fixed categories, item kinds, and repository operations for credit-card persistence and aggregation.
- [x] 1.3 Implement hybrid embedded-text/OCR statement extraction and Pydantic-AI structured parsing with duplicate handling.
- [x] 1.4 Add independent credit-card upload and analytics API endpoints for metrics, monthly activity, category distribution, and statement items.

## 2. Credit-Card Backend Verification

- [x] 2.1 Add unit tests for ingestion classification, duplicate protection, hybrid OCR fallback, and persistence isolation.
- [x] 2.2 Add analytics and router tests for credit metrics, monthly activity, category distribution, and statement-item responses.

## 3. Credit-Card Dashboard

- [x] 3.1 Add frontend API contracts, normalization, and independent credit-card dashboard data hook.
- [x] 3.2 Add responsive credit-card metric cards, monthly activity chart, category donut chart, and statement-item table with financial color semantics.
- [x] 3.3 Add lightweight page navigation and dedicated credit-card statement upload while preserving the existing dashboard and filters.
- [x] 3.4 Add frontend tests covering API contracts, color semantics, table rendering, and page navigation.

## 4. Documentation and Validation

- [x] 4.1 Document credit-card endpoints, hybrid extraction, and local OCR prerequisite in README.
- [x] 4.2 Run backend linting, formatting, type checking, and tests plus frontend linting, tests, and production build.
