from sqlalchemy import Column, Integer, String, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    # 凭证编号，例如 JE-000001
    entry_no = Column(String, unique=True, nullable=False, index=True)

    # 凭证日期
    date = Column(Date, nullable=False)

    # 摘要
    description = Column(String, nullable=False)

    # 状态：draft / posted
    status = Column(String, default="draft", nullable=False)

    lines = relationship(
        "JournalLine",
        back_populates="entry",
        cascade="all, delete-orphan",
    )


class JournalLine(Base):
    __tablename__ = "journal_lines"

    id = Column(Integer, primary_key=True, index=True)

    entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id"),
        nullable=False,
    )

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=False,
    )

    # 借方金额
    debit = Column(Numeric(12, 2), default=0, nullable=False)

    # 贷方金额
    credit = Column(Numeric(12, 2), default=0, nullable=False)

    # 行摘要，可为空
    description = Column(String, nullable=True)

    entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("Account")