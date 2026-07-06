## 1. Default Category Seeder

- [x] 1.1 Add `seed_default_categories(db)` with the seven Spanish default categories and idempotent name checks
- [x] 1.2 Invoke `seed_default_categories` from `init_db()` on every startup, before optional mock data seeding

## 2. Verification

- [x] 2.1 Add tests for fresh-database seeding and idempotent re-run behavior
- [x] 2.2 Run backend lint, type check, and pytest
