from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account import Account

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


@router.get("")
def list_accounts(db: Session = Depends(get_db)):
    accounts = db.query(Account).order_by(Account.code.asc()).all()

    return [
        {
            "id": account.id,
            "code": account.code,
            "name": account.name,
            "type": account.type,
            "normal_balance": account.normal_balance,
            "is_active": account.is_active,
        }
        for account in accounts
    ]