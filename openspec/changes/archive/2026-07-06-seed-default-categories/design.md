## Context

`init_db()` currently creates tables and optionally seeds mock demo data when `seed_mock_data` is enabled. The mock seeder defines its own English category names for demo transactions, but production-like deployments with `seed_mock_data=false` start with no categories. Statement ingestion and distribution analytics depend on categories existing in the database.

## Goals / Non-Goals

**Goals:**
- Always attempt to populate the seven default categories on every application initialization.
- Make seeding idempotent: existing category names must not cause startup failures.
- Keep default category seeding separate from optional mock demo data.

**Non-Goals:**
- Changing the optional mock data seeder or its English demo categories.
- Migrating or renaming categories in existing databases.
- Exposing category management APIs.

## Decisions

1. **Dedicated `seed_default_categories` function** — Extract default category seeding into its own module function rather than embedding SQL in `database.py`. This mirrors the existing `seed_mock_data` pattern and keeps `init_db()` readable.

2. **ORM upsert-by-name, not raw SQL** — Use SQLAlchemy `Category` inserts with a pre-check for existing names (case-sensitive match on `name` unique constraint). This matches existing `_upsert_categories` logic in `seed_data.py` and avoids duplicating enum handling.

3. **Run after `create_all`, before mock data** — Invoke default category seeding unconditionally after schema sync so mock data (if enabled) can reference categories that already exist. Default categories use Spanish names distinct from mock demo names, so no collision in typical dev setups.

4. **Fixed category catalog** — Hard-code the seven categories from the user requirement rather than loading from config. The list is stable product data, not environment-specific.

## Risks / Trade-offs

- **[Risk] Name collision with user-created categories** → Mitigation: only insert when name is absent; never update or delete existing rows.
- **[Risk] Divergence from mock seeder categories** → Mitigation: mock data keeps its own English names; default seed runs independently and does not remove mock categories.
- **[Trade-off] Startup adds a few DB reads** → Acceptable for a local single-user app; seeding is O(7) lookups.
