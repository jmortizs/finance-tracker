from collections.abc import Generator

from sqlalchemy import create_engine
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

    if get_settings().seed_mock_data:
        with SessionLocal() as db:
            seed_mock_data(db)


if __name__ == "__main__":
    init_db()
