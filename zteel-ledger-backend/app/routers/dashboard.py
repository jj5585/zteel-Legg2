from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, date, timedelta
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


def get_summary(transactions):
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
        "total_income": total_income,
        "total_expense": total_expense,
        "net": net,
        "status": "profit" if net >= 0 else "loss",
        "by_category": by_category,
        "by_payment_method": by_payment,
        "transaction_count": len(transactions),
    }


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

    return {"date": str(target_date), **get_summary(transactions)}


@router.get("/range")
def get_dashboard_range(
    shop_id: str,
    mode: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    ref_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns P&L breakdown for:
    - daily: last 30 days (one row per day)
    - weekly: last 12 weeks (one row per week)
    - monthly: last 12 months (one row per month)
    """
    require_dashboard_access(shop_id, current_user, db)

    today = ref_date or date.today()

    if mode == "daily":
        periods = []
        for i in range(29, -1, -1):
            d = today - timedelta(days=i)
            periods.append({
                "label": d.strftime("%d %b"),
                "start": datetime.combine(d, datetime.min.time()),
                "end": datetime.combine(d, datetime.max.time()),
            })

    elif mode == "weekly":
        periods = []
        # align to Monday of this week
        monday = today - timedelta(days=today.weekday())
        for i in range(11, -1, -1):
            week_start = monday - timedelta(weeks=i)
            week_end = week_start + timedelta(days=6)
            periods.append({
                "label": week_start.strftime("%d %b"),
                "start": datetime.combine(week_start, datetime.min.time()),
                "end": datetime.combine(week_end, datetime.max.time()),
            })

    else:  # monthly
        periods = []
        for i in range(11, -1, -1):
            # go back i months from today
            month = today.month - i
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            period_start = date(year, month, 1)
            period_end = date(year, month, last_day)
            periods.append({
                "label": period_start.strftime("%b %Y"),
                "start": datetime.combine(period_start, datetime.min.time()),
                "end": datetime.combine(period_end, datetime.max.time()),
            })

    # fetch all transactions in the full range at once
    range_start = periods[0]["start"]
    range_end = periods[-1]["end"]

    all_txns = db.query(Transaction).filter(
        Transaction.shop_id == shop_id,
        Transaction.transaction_date >= range_start,
        Transaction.transaction_date <= range_end,
    ).all()

    results = []
    totals_income = 0.0
    totals_expense = 0.0

    for p in periods:
        txns = [t for t in all_txns if p["start"] <= t.transaction_date <= p["end"]]
        income = sum(t.amount for t in txns if t.type == TransactionType.income)
        expense = sum(t.amount for t in txns if t.type == TransactionType.expense)
        net = income - expense
        totals_income += income
        totals_expense += expense
        results.append({
            "label": p["label"],
            "income": income,
            "expense": expense,
            "net": net,
            "transaction_count": len(txns),
        })

    return {
        "mode": mode,
        "periods": results,
        "totals": {
            "income": totals_income,
            "expense": totals_expense,
            "net": totals_income - totals_expense,
            "status": "profit" if (totals_income - totals_expense) >= 0 else "loss",
        }
    }