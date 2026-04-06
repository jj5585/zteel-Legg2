from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, date
from app.database import get_db
from app.models.transaction import Transaction, TransactionType
from app.models.shop_member import ShopMember, MemberRole
from app.models.user import User
from app.core.dependencies import get_current_user
from fastapi import HTTPException

router = APIRouter(prefix="/shops/{shop_id}/dashboard", tags=["dashboard"])


def require_dashboard_access(shop_id: str, current_user: User, db: Session):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this shop")
    if member.role == MemberRole.staff:
        raise HTTPException(status_code=403, detail="Staff cannot access the dashboard")
    return member


@router.get("/")
def get_dashboard(
    shop_id: str,
    date_filter: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_dashboard_access(shop_id, current_user, db)

    target_date = date_filter or date.today()
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())

    transactions = db.query(Transaction).filter(
        Transaction.shop_id == shop_id,
        Transaction.transaction_date >= start,
        Transaction.transaction_date <= end,
    ).all()

    total_income = sum(t.amount for t in transactions if t.type == TransactionType.income)
    total_expense = sum(t.amount for t in transactions if t.type == TransactionType.expense)
    net = total_income - total_expense

    by_category = {}
    for t in transactions:
        key = t.category_id or "uncategorized"
        if key not in by_category:
            by_category[key] = {"income": 0, "expense": 0}
        by_category[key][t.type.value] += t.amount

    by_payment = {}
    for t in transactions:
        key = t.payment_method.value
        if key not in by_payment:
            by_payment[key] = {"income": 0, "expense": 0}
        by_payment[key][t.type.value] += t.amount

    return {
        "date": str(target_date),
        "total_income": total_income,
        "total_expense": total_expense,
        "net": net,
        "status": "profit" if net >= 0 else "loss",
        "by_category": by_category,
        "by_payment_method": by_payment,
        "transaction_count": len(transactions),
    }