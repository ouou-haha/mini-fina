from app.database import SessionLocal, Base, engine
from app.models.account import Account


def init_accounts():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    accounts = [
        {
            "code": "1001",
            "name": "现金",
            "type": "asset",
            "normal_balance": "debit",
        },
        {
            "code": "1002",
            "name": "银行存款",
            "type": "asset",
            "normal_balance": "debit",
        },
        {
            "code": "1122",
            "name": "应收账款",
            "type": "asset",
            "normal_balance": "debit",
        },
        {
            "code": "1405",
            "name": "库存商品",
            "type": "asset",
            "normal_balance": "debit",
        },
        {
            "code": "2202",
            "name": "应付账款",
            "type": "liability",
            "normal_balance": "credit",
        },
        {
            "code": "4001",
            "name": "实收资本",
            "type": "equity",
            "normal_balance": "credit",
        },
        {
            "code": "5001",
            "name": "主营业务收入",
            "type": "revenue",
            "normal_balance": "credit",
        },
        {
            "code": "6001",
            "name": "主营业务成本",
            "type": "expense",
            "normal_balance": "debit",
        },
        {
            "code": "6602",
            "name": "管理费用",
            "type": "expense",
            "normal_balance": "debit",
        },
    ]

    for item in accounts:
        existing = db.query(Account).filter(Account.code == item["code"]).first()
        if existing:
            continue

        account = Account(
            code=item["code"],
            name=item["name"],
            type=item["type"],
            normal_balance=item["normal_balance"],
            is_active=True,
        )
        db.add(account)

    db.commit()
    db.close()

    print("Accounts initialized successfully.")


if __name__ == "__main__":
    init_accounts()