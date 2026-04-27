from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)

    # 科目编码，例如 1001、1002、6001
    code = Column(String, unique=True, nullable=False, index=True)

    # 科目名称，例如 银行存款、应收账款、主营业务收入
    name = Column(String, nullable=False)

    # 科目类型：asset / liability / equity / revenue / expense
    type = Column(String, nullable=False)

    # 正常余额方向：debit / credit
    normal_balance = Column(String, nullable=False)

    # 父级科目，第一版可以先不用，但先留着
    parent_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)

    # 是否启用
    is_active = Column(Boolean, default=True)

    parent = relationship("Account", remote_side=[id])