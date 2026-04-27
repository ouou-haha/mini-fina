from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.journal import JournalEntry, JournalLine
from app.schemas.journal import JournalEntryCreate


def generate_entry_no(db: Session) -> str:
    last_entry = (
        db.query(JournalEntry)
        .order_by(JournalEntry.id.desc())
        .first()
    )

    if last_entry is None:
        next_id = 1
    else:
        next_id = last_entry.id + 1

    return f"JE-{next_id:06d}"


def create_journal_entry(
    db: Session,
    payload: JournalEntryCreate,
) -> JournalEntry:
    if len(payload.lines) < 2:
        raise HTTPException(
            status_code=400,
            detail="A journal entry must have at least two lines.",
        )

    total_debit = sum(line.debit for line in payload.lines)
    total_credit = sum(line.credit for line in payload.lines)

    if total_debit <= Decimal("0.00"):
        raise HTTPException(
            status_code=400,
            detail="Total debit must be greater than zero.",
        )

    if total_debit != total_credit:
        raise HTTPException(
            status_code=400,
            detail=f"Debits and credits are not balanced: debit={total_debit}, credit={total_credit}",
        )

    for line in payload.lines:
        if line.debit > 0 and line.credit > 0:
            raise HTTPException(
                status_code=400,
                detail="A line cannot have both debit and credit greater than zero.",
            )

        account = db.query(Account).filter(Account.id == line.account_id).first()
        if account is None:
            raise HTTPException(
                status_code=404,
                detail=f"Account id {line.account_id} not found.",
            )

    entry = JournalEntry(
        entry_no=generate_entry_no(db),
        date=payload.date,
        description=payload.description,
        status="draft",
    )

    for line in payload.lines:
        entry.lines.append(
            JournalLine(
                account_id=line.account_id,
                debit=line.debit,
                credit=line.credit,
                description=line.description,
            )
        )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry

def post_journal_entry(
    db: Session,
    entry_id: int,
) -> JournalEntry:
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id)
        .first()
    )

    if entry is None:
        raise HTTPException(
            status_code=404,
            detail=f"Journal entry {entry_id} not found.",
        )

    if entry.status == "posted":
        raise HTTPException(
            status_code=400,
            detail="Journal entry is already posted.",
        )

    if entry.status != "draft":
        raise HTTPException(
            status_code=400,
            detail=f"Only draft journal entries can be posted. Current status: {entry.status}",
        )

    if len(entry.lines) < 2:
        raise HTTPException(
            status_code=400,
            detail="A journal entry must have at least two lines.",
        )

    total_debit = sum(line.debit for line in entry.lines)
    total_credit = sum(line.credit for line in entry.lines)

    if total_debit <= Decimal("0.00"):
        raise HTTPException(
            status_code=400,
            detail="Total debit must be greater than zero.",
        )

    if total_debit != total_credit:
        raise HTTPException(
            status_code=400,
            detail=f"Debits and credits are not balanced: debit={total_debit}, credit={total_credit}",
        )

    entry.status = "posted"

    db.commit()
    db.refresh(entry)

    return entry