from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.domain_entities import Category, TransactionType

DEFAULT_CATEGORIES: tuple[tuple[str, TransactionType], ...] = (
    ("ingresos", TransactionType.INCOME),
    ("egresos", TransactionType.EXPENSE),
    ("salario", TransactionType.INCOME),
    ("intereses", TransactionType.INCOME),
    ("pago tarjeta crédito", TransactionType.EXPENSE),
    ("seguros", TransactionType.EXPENSE),
    ("retiro de efectivo", TransactionType.EXPENSE),
)


def seed_default_categories(db: Session) -> None:
    existing = {category.name for category in db.scalars(select(Category)).all()}
    for name, transaction_type in DEFAULT_CATEGORIES:
        if name not in existing:
            db.add(Category(name=name, type=transaction_type))
    db.commit()
