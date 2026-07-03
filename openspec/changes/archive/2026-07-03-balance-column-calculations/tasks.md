## 1. Schema and Ingestion

- [x] 1.1 Remove `previous_balance` from transaction database schema/model definitions.
- [x] 1.2 Remove `previous_balance` from the AI extraction response validation schema.
- [x] 1.3 Update statement transaction persistence to store only `balance` as balance context.

## 2. Dashboard Balance Calculations

- [x] 2.1 Update current balance metric logic to use the latest non-null transaction `balance` snapshot under active filters.
- [x] 2.2 Update previous-month balance baseline logic to use the latest non-null transaction `balance` snapshot.
- [x] 2.3 Update balance evolution chart logic to return monthly latest non-null transaction `balance` snapshots.

## 3. Tests and Verification

- [x] 3.1 Update or add backend tests for ingestion schema/persistence without `previous_balance`.
- [x] 3.2 Update or add backend tests for balance metrics and balance evolution from `balance` snapshots.
- [x] 3.3 Run project verification commands and fix regressions.
