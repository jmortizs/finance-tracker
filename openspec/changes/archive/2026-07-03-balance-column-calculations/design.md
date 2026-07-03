## Context

Statement ingestion introduced transaction-level balance context with both `previous_balance` and `balance`. The dashboard currently calculates balances from transaction amounts in some paths, while imported statements provide account balance snapshots that should be treated as authoritative for current balance and monthly closing balance displays.

## Goals / Non-Goals

**Goals:**

- Remove `previous_balance` from the transactions schema, ORM model, ingestion schema, and persistence logic.
- Use transaction `balance` values for current balance and balance evolution calculations when balance snapshots exist.
- Keep existing income, expense, net savings, filters, and statement duplicate behavior intact.

**Non-Goals:**

- Rebuild transaction classification, account management, or savings goal calculations.
- Add multi-user access control or cloud integrations.
- Backfill missing historical balance values.

## Decisions

- Treat `transactions.balance` as the authoritative balance snapshot for dashboard balance views. This avoids re-deriving balances from amounts when bank statement balance data is available.
- Select the latest transaction row with a non-null `balance` for current balance, filtered by account, bank, and date as applicable. This preserves filter behavior and ignores transactions that do not provide balance snapshots.
- Build balance evolution from the latest non-null `balance` in each month, rather than summing income and expenses. This aligns the graph with bank statement closing balances.
- Remove `previous_balance` directly instead of keeping a deprecated compatibility field because this is a local single-user system with no external API compatibility requirement.

## Risks / Trade-offs

- [Risk] Existing local databases may still contain a `previous_balance` column. -> Mitigation: schema initialization/synchronization should no longer require it; local deployments can recreate or migrate the database as needed.
- [Risk] Some transactions may have null `balance` values. -> Mitigation: balance calculations use non-null snapshots and return zero or empty chart data when no balance snapshots are available.
- [Risk] Dashboard balance values may differ from derived cash-flow totals. -> Mitigation: this is intentional because imported statement balances are authoritative snapshots.

## Migration Plan

- Update the application schema/model definitions to omit `previous_balance`.
- Update ingestion output validation and insertion logic to persist only `balance` as transaction balance context.
- Update dashboard queries and tests to read balance snapshots from `transactions.balance`.
- Archive the OpenSpec change after verification syncs the updated requirements into main specs.

## Open Questions

- None.
