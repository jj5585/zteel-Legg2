from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class Shop(Base):
    __tablename__ = "shops"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("ShopMember", back_populates="shop")
    categories = relationship("Category", back_populates="shop")
    transactions = relationship("Transaction", back_populates="shop")