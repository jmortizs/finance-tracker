from typing import Generic, TypeVar

from sqlalchemy.orm import Session

from app.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: type[ModelType]) -> None:
        self.db = db
        self.model = model

    def get(self, entity_id: int) -> ModelType | None:
        return self.db.get(self.model, entity_id)

    def list(self) -> list[ModelType]:
        return list(self.db.query(self.model).all())
