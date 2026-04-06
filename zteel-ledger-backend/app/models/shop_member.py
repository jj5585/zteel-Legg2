import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class MemberRole(str, enum.Enum):
    owner = "owner"
    partner = "partner"
    staff = "staff"


class ShopMember(Base):
    __tablename__ = "shop_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String, ForeignKey("shops.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(MemberRole), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("Shop", back_populates="members")
    user = relationship("User", back_populates="shop_memberships")