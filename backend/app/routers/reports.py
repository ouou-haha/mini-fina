from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account import Account
from app.models.journal import JournalEntry, JournalLine

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/trial-balance")
def trial_balance(db: Session = Depends(get_db)):
    accounts = (
        db.query(Account)
        .filter(Account.is_active == True)
        .order_by(Account.code.asc())
        .all()
    )

    rows = []

    total_debit = Decimal("0.00")
    total_credit = Decimal("0.00")

    for account in accounts:
        lines = (
            db.query(JournalLine)
            .join(JournalEntry, JournalLine.entry_id == JournalEntry.id)
            .filter(JournalEntry.status == "posted")
            .filter(JournalLine.account_id == account.id)
            .all()
        )

        debit_sum = sum(line.debit for line in lines)
        credit_sum = sum(line.credit for line in lines)

        # 发生额合计，用于试算平衡
        total_debit += debit_sum
        total_credit += credit_sum

        # 余额方向：资产/费用通常借方余额；负债/权益/收入通常贷方余额
        if account.normal_balance == "debit":
            ending_balance = debit_sum - credit_sum
        else:
            ending_balance = credit_sum - debit_sum

        rows.append(
            {
                "account_id": account.id,
                "account_code": account.code,
                "account_name": account.name,
                "account_type": account.type,
                "normal_balance": account.normal_balance,
                "debit": float(debit_sum),
                "credit": float(credit_sum),
                "ending_balance": float(ending_balance),
            }
        )

    return {
        "rows": rows,
        "summary": {
            "total_debit": float(total_debit),
            "total_credit": float(total_credit),
            "is_balanced": total_debit == total_credit,
        },
    }

@router.get("/income-statement")
def income_statement(db: Session = Depends(get_db)):
    accounts = (
        db.query(Account)
        .filter(Account.is_active == True)
        .filter(Account.type.in_(["revenue", "expense"]))
        .order_by(Account.code.asc())
        .all()
    )

    rows = []

    total_revenue = Decimal("0.00")
    total_expense = Decimal("0.00")

    for account in accounts:
        lines = (
            db.query(JournalLine)
            .join(JournalEntry, JournalLine.entry_id == JournalEntry.id)
            .filter(JournalEntry.status == "posted")
            .filter(JournalLine.account_id == account.id)
            .all()
        )

        debit_sum = sum(line.debit for line in lines)
        credit_sum = sum(line.credit for line in lines)

        if account.type == "revenue":
            # 收入类科目通常是贷方增加
            amount = credit_sum - debit_sum
            total_revenue += amount
        elif account.type == "expense":
            # 费用类科目通常是借方增加
            amount = debit_sum - credit_sum
            total_expense += amount
        else:
            amount = Decimal("0.00")

        rows.append(
            {
                "account_id": account.id,
                "account_code": account.code,
                "account_name": account.name,
                "account_type": account.type,
                "amount": float(amount),
                "debit": float(debit_sum),
                "credit": float(credit_sum),
            }
        )

    net_income = total_revenue - total_expense

    return {
        "rows": rows,
        "summary": {
            "total_revenue": float(total_revenue),
            "total_expense": float(total_expense),
            "net_income": float(net_income),
        },
    }

@router.get("/balance-sheet")
def balance_sheet(db: Session = Depends(get_db)):
    accounts = (
        db.query(Account)
        .filter(Account.is_active == True)
        .filter(Account.type.in_(["asset", "liability", "equity"]))
        .order_by(Account.code.asc())
        .all()
    )

    asset_rows = []
    liability_rows = []
    equity_rows = []

    total_assets = Decimal("0.00")
    total_liabilities = Decimal("0.00")
    total_equity = Decimal("0.00")

    for account in accounts:
        lines = (
            db.query(JournalLine)
            .join(JournalEntry, JournalLine.entry_id == JournalEntry.id)
            .filter(JournalEntry.status == "posted")
            .filter(JournalLine.account_id == account.id)
            .all()
        )

        debit_sum = sum(line.debit for line in lines)
        credit_sum = sum(line.credit for line in lines)

        if account.normal_balance == "debit":
            amount = debit_sum - credit_sum
        else:
            amount = credit_sum - debit_sum

        row = {
            "account_id": account.id,
            "account_code": account.code,
            "account_name": account.name,
            "account_type": account.type,
            "amount": float(amount),
            "debit": float(debit_sum),
            "credit": float(credit_sum),
        }

        if account.type == "asset":
            asset_rows.append(row)
            total_assets += amount

        elif account.type == "liability":
            liability_rows.append(row)
            total_liabilities += amount

        elif account.type == "equity":
            equity_rows.append(row)
            total_equity += amount

    # 计算未分配利润：收入 - 费用
    income_accounts = (
        db.query(Account)
        .filter(Account.is_active == True)
        .filter(Account.type.in_(["revenue", "expense"]))
        .all()
    )

    total_revenue = Decimal("0.00")
    total_expense = Decimal("0.00")

    for account in income_accounts:
        lines = (
            db.query(JournalLine)
            .join(JournalEntry, JournalLine.entry_id == JournalEntry.id)
            .filter(JournalEntry.status == "posted")
            .filter(JournalLine.account_id == account.id)
            .all()
        )

        debit_sum = sum(line.debit for line in lines)
        credit_sum = sum(line.credit for line in lines)

        if account.type == "revenue":
            total_revenue += credit_sum - debit_sum
        elif account.type == "expense":
            total_expense += debit_sum - credit_sum

    retained_earnings = total_revenue - total_expense

    equity_rows.append(
        {
            "account_id": None,
            "account_code": "RE",
            "account_name": "未分配利润",
            "account_type": "equity",
            "amount": float(retained_earnings),
            "debit": 0.0,
            "credit": 0.0,
        }
    )

    total_equity_with_profit = total_equity + retained_earnings

    right_side_total = total_liabilities + total_equity_with_profit

    return {
        "assets": {
            "rows": asset_rows,
            "total": float(total_assets),
        },
        "liabilities": {
            "rows": liability_rows,
            "total": float(total_liabilities),
        },
        "equity": {
            "rows": equity_rows,
            "total_without_retained_earnings": float(total_equity),
            "retained_earnings": float(retained_earnings),
            "total": float(total_equity_with_profit),
        },
        "summary": {
            "total_assets": float(total_assets),
            "total_liabilities": float(total_liabilities),
            "total_equity": float(total_equity_with_profit),
            "right_side_total": float(right_side_total),
            "is_balanced": total_assets == right_side_total,
        },
    }