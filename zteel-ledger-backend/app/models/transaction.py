from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import enum
from datetime import datetime

class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"

class PaymentMethod(str, enum.Enum):
    cash = "cash"
    upi = "upi"
    card = "card"
    other = "other"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String, ForeignKey("shops.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    note = Column(Text, nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("Shop", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    created_by_user = relationship("User", back_populates="transactions")