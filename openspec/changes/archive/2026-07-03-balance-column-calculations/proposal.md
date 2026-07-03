## Why

Statement ingestion currently stores both `previous_balance` and `balance`, but only `balance` is needed as the account balance snapshot from bank statements. Dashboard balance metrics and balance evolution should use those persisted balance snapshots instead of deriving balances from transaction amounts when statement balances are available.

## What Changes

- **BREAKING** Remove the `previous_balance` column from the transactions table and ingestion persistence path.
- Remove `previous_balance` from the AI extraction response validation schema.
- Update current balance metric calculations to use transaction `balance` values as authoritative balance snapshots.
- Update the balance evolution graph to plot monthly closing values from the transaction `balance` column.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `statement-ingestion`: Transaction persistence and AI extraction no longer include `previous_balance`; retained balance context is the `balance` column.
- `dashboard-frontend`: Dashboard balance metrics and balance evolution use persisted transaction balance snapshots for balance calculations.

## Impact

- Backend database schema and transaction model remove `previous_balance`.
- Statement AI response models, validation, and insertion code no longer accept or store `previous_balance`.
- Dashboard metrics/chart query logic changes to prefer transaction `balance` snapshots.
- Tests and documentation/specs update to reflect the streamlined balance model.
