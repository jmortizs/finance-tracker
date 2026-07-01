## 1. Backend Filter Options

- [ ] 1.1 Add repository support for returning the minimum and maximum `transactions.transaction_date` values.
- [ ] 1.2 Extend the backend filter-options schema with nullable `min_transaction_date` and `max_transaction_date` fields.
- [ ] 1.3 Update the analytics service so `/api/v1/filters/options` includes the transaction date bounds alongside banks and accounts.

## 2. Frontend Date Defaults

- [ ] 2.1 Extend frontend filter option types to include nullable transaction date bounds.
- [ ] 2.2 Add or update filter utilities to derive dashboard date defaults from the loaded transaction date bounds.
- [ ] 2.3 Initialize frontend date filters from loaded bounds without overwriting user-edited date selections on later metadata refreshes.
- [ ] 2.4 Update reset behavior so date filters return to loaded transaction bounds while bank and account filters clear.
- [ ] 2.5 Preserve empty date controls when the backend returns no transaction date bounds.

## 3. Verification

- [ ] 3.1 Add or update backend tests for filter options with populated and empty transaction date bounds.
- [ ] 3.2 Add or update frontend tests for initial date defaults, reset behavior, and empty-bound handling.
- [ ] 3.3 Run backend linting and relevant backend tests.
- [ ] 3.4 Run frontend linting and relevant frontend tests.
