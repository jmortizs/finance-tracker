from __future__ import annotations

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database import Base
from app.default_categories import DEFAULT_CATEGORIES, seed_default_categories
from app.models.domain_entities import Category, TransactionType


def make_session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return Session(engine)


def test_seed_default_categories_populates_fresh_database() -> None:
    with make_session() as session:
        seed_default_categories(session)
        categories = list(session.scalars(select(Category).order_by(Category.name)).all())

    assert len(categories) == len(DEFAULT_CATEGORIES)
    seeded = {(category.name, category.type) for category in categories}
    assert seeded == set(DEFAULT_CATEGORIES)


def test_seed_default_categories_is_idempotent() -> None:
    with make_session() as session:
        seed_default_categories(session)
        seed_default_categories(session)
        categories = list(session.scalars(select(Category)).all())

    assert len(categories) == len(DEFAULT_CATEGORIES)


def test_seed_default_categories_skips_existing_names() -> None:
    with make_session() as session:
        session.add(Category(name="salary", type=TransactionType.EXPENSE))
        session.commit()

        seed_default_categories(session)
        salary = session.scalar(select(Category).where(Category.name == "salary"))
        categories = list(session.scalars(select(Category)).all())

    assert salary is not None
    assert salary.type == TransactionType.EXPENSE
    assert len(categories) == len(DEFAULT_CATEGORIES)
