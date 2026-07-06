## Why

Fresh deployments start with an empty `categories` table, which blocks statement ingestion, analytics distribution charts, and transaction classification until categories are added manually. Seeding a fixed set of default categories on application startup ensures the dashboard is usable immediately after initialization.

## What Changes

- Add idempotent default category seeding during `init_db()` on every application startup.
- Seed seven Spanish-named categories matching the project's income/expense taxonomy (`ingresos`, `egresos`, `salario`, `intereses`, `pago tarjeta crédito`, `seguros`, `retiro de efectivo`).
- Skip inserts for category names that already exist so restarts and re-initialization do not fail on unique constraints.

## Capabilities

### New Capabilities
- `database-initialization`: Covers startup database setup, including default category seeding on application initialization.

### Modified Capabilities

## Impact

- `backend/app/database.py` — invoke category seeding after schema creation.
- New or updated seeding module for default categories (separate from optional mock demo data).
- Backend tests covering idempotent category seeding behavior.
