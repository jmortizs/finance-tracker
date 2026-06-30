# AGENTS.md - Backend & Database Guidelines

## Backend Stack & Architecture
* The backend software application relies on Python 3.13 and FastAPI.
* The backend Docker image must utilize a multi-stage structure or standard optimized footprint leveraging Python 3.13 slim builds.
* The design architecture enforces strict adherence to SOLID and DRY principles using a clean, layered architectural approach.
* Database management operations must be isolated into explicit repositories.
* Domain operations must be structured within services.
* Data transformation boundaries must rely strictly on Pydantic v2 validation layers.

## Database Schema & Rules
* The data model is engineered natively for PostgreSQL 18.4.
* The database encompasses five core entities: `banks`, `accounts`, `categories`, `transactions`, and `savings_goals`.
* Expenses must be recorded as positive values and classified by a transaction type Enum (`INCOME` or `EXPENSE`).
* Optimize global filters using specific database indexes on transaction dates, account IDs, and a composite of both.

## API Contract Limits
* All REST endpoints must fall under the `/api/v1/` URI pattern.
* Do not build authentication endpoints.

## Virtual Environment and Code validation
* Use UV to manage the virtual environment and run Python code.
* Lint: `ruff check app`
* Format: `ruff format app`
* Type check: `mypy app`
* Pytest: `uv run pytest`