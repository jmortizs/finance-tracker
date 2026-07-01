
# RELATIONAL DATABASE DESIGN

The data model is engineered natively for PostgreSQL 18.4. It handles core banking infrastructure, precise financial records, categorizations, and target thresholds.

## DATA SCHEMA DDL

**Data Schema Initialization Script**

```sql
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE'); -- [cite: 80]

CREATE TABLE banks ( -- [cite: 81]
    id SERIAL PRIMARY KEY, -- [cite: 82]
    name VARCHAR(100) NOT NULL UNIQUE, -- [cite: 83]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- [cite: 84]
);

CREATE TABLE accounts ( -- [cite: 86]
    id SERIAL PRIMARY KEY, -- [cite: 88]
    bank_id INT NOT NULL REFERENCES banks (id) ON DELETE CASCADE, -- [cite: 89]
    account_number VARCHAR(50) NOT NULL UNIQUE, -- [cite: 89]
    name VARCHAR(100) NOT NULL, -- [cite: 90]
    currency VARCHAR(3) DEFAULT 'USD', -- [cite: 91]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- [cite: 92]
);

CREATE TABLE categories ( -- [cite: 93]
    id SERIAL PRIMARY KEY, -- [cite: 95]
    name VARCHAR(100) NOT NULL UNIQUE, -- [cite: 96]
    type transaction_type NOT NULL, -- [cite: 97]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- [cite: 98]
);

CREATE TABLE transactions ( -- [cite: 99]
    id SERIAL PRIMARY KEY, -- [cite: 100]
    account_id INT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE, -- [cite: 101]
    category_id INT REFERENCES categories (id) ON DELETE SET NULL, -- [cite: 102]
    amount NUMERIC (15, 2) NOT NULL, -- [cite: 103]
    transaction_date DATE NOT NULL, -- [cite: 104]
    description VARCHAR(255), -- [cite: 105]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- [cite: 106]
);

CREATE TABLE savings_goals ( -- [cite: 108]
    id SERIAL PRIMARY KEY, -- [cite: 110]
    name VARCHAR(100) NOT NULL UNIQUE, -- [cite: 111]
    target_amount NUMERIC (15, 2) NOT NULL, -- [cite: 112]
    current_amount NUMERIC(15, 2) DEFAULT 0.00 NOT NULL, -- [cite: 113]
    target_date DATE NOT NULL, -- [cite: 114]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- [cite: 115]
);

```

**Indexing Strategy for Global Filters Optimization**

```sql
CREATE INDEX idx_transactions_date ON transactions (transaction_date); -- [cite: 117]
CREATE INDEX idx_transactions_account ON transactions (account_id); -- [cite: 118]
CREATE INDEX idx_transactions_composite ON transactions (account_id, transaction_date); -- [cite: 119]

```
---

## ENTITY-RELATIONSHIP DESCRIPTION TABLE

| ENTITY NAME | PRIMARY ATTRIBUTES | RELATIONSHIPS / CARDINALITY | FUNCTIONAL CONTEXT |
| --- | --- | --- | --- |
| **banks**  | id, name | One-to-Many with accounts  | Represents financial institutions. |
| **accounts**  | id, bank_id, account_number, name  | Many-to-One with banks, One-to-Many with transactions  | Specific isolation vectors for financial liquid funds. |
| **categories**  | id, name, type  | One-to-Many with transactions  | Classification targets for tracking allocations.  |
| **transactions**  | id, account_id, category_id, amount, transaction_date  | Many-to-One with accounts and categories  | Atomic financial modifications. Expenses recorded as positive values (classified by type).  |
| **savings_goals**  | id, name, target_amount, current_amount, target_date  | None (Isolated Metric)  | Target threshold engine for mathematical savings tracking.  |
---
# BACKEND SERVICE ARCHITECTURE
The backend software application relies on **Python 3.13** and **FastAPI.** The design architecture enforces strict adherence to **SOLID** and **DRY** principles using a clean, layered architectural approach.

## REPOSITORY-SERVICE MODULAR LAYOUT
The system isolates implementation layers to guarantee maximum maintainability. Database management operations are isolated into explicit repositories, domain operations are structured within services, and data transformation boundaries rely strictly on Pydantic v2 validation layers.

```
backend/
├── app/
│ ├── __init__.py
│ ├── main.py
│ ├── config.py
│ ├── database.py
│ ├── models/
│ │ ├── __init__.py
│ │ └── domain_entities.py # SQLAlchemy Models (banks, accounts, etc.)
│ ├── schemas/
│ │ ├── __init__.py
│ │ └── data_transfer.py # Pydantic Request/Response Models
│ ├── repositories/
│ │ ├── __init__.py
│ │ ├── base_repository.py # Generic DRY Base Class
│ │ └── finance_repo.py # SQL Aggregations and Raw Operations
│ ├── services/
│ │ ├── __init__.py
│ │ └── analytics_engine.py # Core Financial Calculation Rules
│ └── routers/
│ ├── __init__.py
│ └── metrics_gateway.py # REST Endpoints
├── requirements.txt
└── Dockerfile
```
## API CONTRACT DOCUMENTATION
| HTTP VERB | URI PATTERN | QUERY PARAMETERS | JSON RESPONSE DEFINITION SUMMARY |
| --- | --- | --- | --- |
| GET | `/api/v1/filters/options` | None | `{ "banks": [...], "accounts": [...], "min_transaction_date": "YYYY-MM-DD" \| null, "max_transaction_date": "YYYY-MM-DD" \| null }` |
| GET | `/api/v1/dashboard/metrics` | `start_date`, `end_date`, `bank_id`, `account_id` | Unified payload containing Balance, Income, Expenses, and savings percentage metrics plus MoM variations. |
| GET | `/api/v1/dashboard/charts/balance-evolution` | `bank_id`, `account_id` | Historical timeline dataset tracking balance month-over-month. |
| GET | `/api/v1/dashboard/charts/cash-flow` | `start_date`, `end_date`, `bank_id`, `account_id` | Paired arrays of income, negative expenses, and computed net savings across time. |
| GET | `/api/v1/dashboard/charts/distribution` | `start_date`, `end_date`, `bank_id`, `account_id`, `type` | Categorized summary matrix mapping structural tags to numerical percentages. |
