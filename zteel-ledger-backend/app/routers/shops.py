from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.shop import Shop
from app.models.shop_member import ShopMember, MemberRole
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/shops", tags=["shops"])


class ShopCreate(BaseModel):
    name: str
    description: Optional[str] = None


@router.post("/")
def create_shop(payload: ShopCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shop = Shop(name=payload.name, description=payload.description)
    db.add(shop)
    db.flush()
    member = ShopMember(shop_id=shop.id, user_id=current_user.id, role=MemberRole.owner)
    db.add(member)
    db.commit()
    db.refresh(shop)
    return {"id": shop.id, "name": shop.name, "description": shop.description, "created_at": shop.created_at}


@router.get("/")
def get_my_shops(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(ShopMember).filter(ShopMember.user_id == current_user.id).all()
    result = []
    for m in memberships:
        shop = db.query(Shop).filter(Shop.id == m.shop_id).first()
        result.append({"id": shop.id, "name": shop.name, "description": shop.description, "role": m.role, "created_at": shop.created_at})
    return result


@router.get("/{shop_id}")
def get_shop(shop_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this shop")
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    return {"id": shop.id, "name": shop.name, "description": shop.description, "role": member.role, "created_at": shop.created_at}