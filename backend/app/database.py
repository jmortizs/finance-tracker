from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import domain_entities  # noqa: F401
    from app.seed_data import seed_mock_data

    Base.metadata.create_all(bind=engine)
    sync_statement_schema()

    if get_settings().seed_mock_data:
        with SessionLocal() as db:
            seed_mock_data(db)


def sync_statement_schema() -> None:
    inspector = inspect(engine)
    if "transactions" not in inspector.get_table_names():
        return

    transaction_columns = {column["name"] for column in inspector.get_columns("transactions")}
    statements = []
    if "previous_balance" in transaction_columns:
        statements.append("ALTER TABLE transactions DROP COLUMN previous_balance")
    if "balance" not in transaction_columns:
        statements.append("ALTER TABLE transactions ADD COLUMN balance NUMERIC(15, 2)")
    if "bank_id" not in transaction_columns:
        statements.append("ALTER TABLE transactions ADD COLUMN bank_id VARCHAR(100)")

    statements.extend(
        [
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_statements_file_hash ON statements (file_hash)",
            "CREATE INDEX IF NOT EXISTS idx_transactions_bank_duplicate "
            "ON transactions (account_id, bank_id, transaction_date)",
        ]
    )

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


if __name__ == "__main__":
    init_db()
