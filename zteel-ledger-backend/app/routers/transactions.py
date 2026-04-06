from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.database import get_db
from app.models.transaction import Transaction, TransactionType, PaymentMethod
from app.models.shop_member import ShopMember
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/shops/{shop_id}/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
    type: TransactionType
    amount: float
    payment_method: PaymentMethod
    category_id: Optional[str] = None
    note: Optional[str] = None
    transaction_date: Optional[datetime] = None


def require_member(shop_id: str, current_user: User, db: Session):
    member = db.query(ShopMember).filter(ShopMember.shop_id == shop_id, ShopMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this shop")
    return member


@router.post("/")
def add_transaction(shop_id: str, payload: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_member(shop_id, current_user, db)
    transaction = Transaction(
        shop_id=shop_id,
        created_by=current_user.id,
        type=payload.type,
        amount=payload.amount,
        payment_method=payload.payment_method,
        category_id=payload.category_id,
        note=payload.note,
        transaction_date=payload.transaction_date or datetime.utcnow(),
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return {"id": transaction.id, "type": transaction.type, "amount": transaction.amount, "payment_method": transaction.payment_method, "note": transaction.note, "transaction_date": transaction.transaction_date}


@router.get("/")
def list_transactions(
    shop_id: str,
    date_filter: Optional[date] = Query(None),
    type_filter: Optional[TransactionType] = Query(None),
    category_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_member(shop_id, current_user, db)
    query = db.query(Transaction).filter(Transaction.shop_id == shop_id)
    if date_filter:
        query = query.filter(Transaction.transaction_date >= datetime.combine(date_filter, datetime.min.time()),
                             Transaction.transaction_date < datetime.combine(date_filter, datetime.max.time()))
    if type_filter:
        query = query.filter(Transaction.type == type_filter)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    transactions = query.order_by(Transaction.transaction_date.desc()).all()
    return [{"id": t.id, "type": t.type, "amount": t.amount, "payment_method": t.payment_method, "category_id": t.category_id, "note": t.note, "created_by": t.created_by, "transaction_date": t.transaction_date} for t in transactions]


@router.delete("/{transaction_id}")
def delete_transaction(shop_id: str, transaction_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = require_member(shop_id, current_user, db)
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.shop_id == shop_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.created_by != current_user.id and member.role not in ["owner", "partner"]:
        raise HTTPException(status_code=403, detail="Not allowed to delete this transaction")
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted"}
