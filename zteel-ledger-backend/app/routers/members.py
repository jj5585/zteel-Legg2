from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.shop_member import ShopMember, MemberRole
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/shops/{shop_id}/members", tags=["members"])


def require_owner(shop_id: str, current_user: User, db: Session):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member or member.role != MemberRole.owner:
        raise HTTPException(status_code=403, detail="Only owners can perform this action")
    return member


def require_member(shop_id: str, current_user: User, db: Session):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this shop")
    return member


class InviteMember(BaseModel):
    email: str
    role: MemberRole


class UpdateRole(BaseModel):
    role: MemberRole


@router.get("/")
def list_members(shop_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_member(shop_id, current_user, db)
    members = db.query(ShopMember).filter(ShopMember.shop_id == shop_id).all()
    result = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({"user_id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url, "role": m.role, "joined_at": m.joined_at})
    return result


@router.post("/")
def invite_member(shop_id: str, payload: InviteMember, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_owner(shop_id, current_user, db)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with that email. They must sign in once first.")
    existing = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    member = ShopMember(shop_id=shop_id, user_id=user.id, role=payload.role)
    db.add(member)
    db.commit()
    return {"message": f"{user.name} added as {payload.role}"}


@router.patch("/{user_id}/role")
def update_role(shop_id: str, user_id: str, payload: UpdateRole, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_owner(shop_id, current_user, db)
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    member.role = payload.role
    db.commit()
    return {"message": "Role updated"}


@router.delete("/{user_id}")
def remove_member(shop_id: str, user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_owner(shop_id, current_user, db)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}