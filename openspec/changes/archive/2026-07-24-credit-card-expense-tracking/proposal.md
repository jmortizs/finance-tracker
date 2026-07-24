## Why

Credit-card spending and revolving debt are currently invisible to the local finance dashboard. Users need an independent view that converts uploaded card statements into an accurate statement balance, credit-health metrics, spending trends, and installment obligations.

## What Changes

- Add a dedicated credit-card dashboard page with statement balance, utilization, available credit, weighted APR, active installment-plan metrics, monthly activity chart, category distribution chart, and statement-item table.
- Add independent credit-card statement storage, AI-assisted hybrid PDF extraction, persistence, and analytics endpoints.
- Categorize card purchases with the fixed credit-card category set: groceries, dining and delivery, fitness, fuel, clothing, subscriptions, insurance, and others.
- Add a dedicated credit-card statement upload control without changing existing bank-statement ingestion or dashboard behavior.

## Capabilities

### New Capabilities
- `credit-card-tracking`: Local credit-card statement ingestion, classification, analytics, and independent dashboard experience.

### Modified Capabilities

None.

## Impact

- Backend SQLAlchemy models, repository, services, schemas, API routers, database initialization, and tests.
- Frontend application navigation, API client, types, dashboard hook, charts, table, and tests.
- README API and operating documentation.
