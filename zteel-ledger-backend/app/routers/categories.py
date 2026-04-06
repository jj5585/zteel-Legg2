from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.category import Category
from app.models.shop_member import ShopMember, MemberRole
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/shops/{shop_id}/categories", tags=["categories"])


class CategoryCreate(BaseModel):
    name: str


def require_owner(shop_id: str, current_user: User, db: Session):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member or member.role != MemberRole.owner:
        raise HTTPException(status_code=403, detail="Only owners can manage categories")
    return member


def require_member(shop_id: str, current_user: User, db: Session):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this shop")
    return member


@router.get("/")
def list_categories(shop_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_member(shop_id, current_user, db)
    categories = db.query(Category).filter(Category.shop_id == shop_id).all()
    return [{"id": c.id, "name": c.name, "created_at": c.created_at} for c in categories]


@router.post("/")
def create_category(shop_id: str, payload: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_owner(shop_id, current_user, db)
    category = Category(shop_id=shop_id, name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"id": category.id, "name": category.name, "created_at": category.created_at}


@router.delete("/{category_id}")
def delete_category(shop_id: str, category_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_owner(shop_id, current_user, db)
    category = db.query(Category).filter(Category.id == category_id, Category.shop_id == shop_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}