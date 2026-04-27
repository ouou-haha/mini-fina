from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.journal import JournalEntry
from app.schemas.journal import JournalEntryCreate
from app.services.journal_service import create_journal_entry, post_journal_entry

router = APIRouter(
    prefix="/journal-entries",
    tags=["Journal Entries"],
)


def serialize_entry(entry: JournalEntry):
    return {
        "id": entry.id,
        "entry_no": entry.entry_no,
        "date": entry.date,
        "description": entry.description,
        "status": entry.status,
        "lines": [
            {
                "id": line.id,
                "account_id": line.account_id,
                "account_code": line.account.code if line.account else None,
                "account_name": line.account.name if line.account else None,
                "debit": float(line.debit),
                "credit": float(line.credit),
                "description": line.description,
            }
            for line in entry.lines
        ],
    }


@router.post("")
def create_entry(
    payload: JournalEntryCreate,
    db: Session = Depends(get_db),
):
    entry = create_journal_entry(db, payload)
    return serialize_entry(entry)


@router.get("")
def list_entries(db: Session = Depends(get_db)):
    entries = (
        db.query(JournalEntry)
        .options(
            joinedload(JournalEntry.lines),
        )
        .order_by(JournalEntry.date.desc(), JournalEntry.id.desc())
        .all()
    )

    return [serialize_entry(entry) for entry in entries]


@router.get("/{entry_id}")
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
):
    entry = (
        db.query(JournalEntry)
        .options(
            joinedload(JournalEntry.lines),
        )
        .filter(JournalEntry.id == entry_id)
        .first()
    )

    if entry is None:
        raise HTTPException(
            status_code=404,
            detail=f"Journal entry {entry_id} not found.",
        )

    return serialize_entry(entry)

@router.post("/{entry_id}/post")
def post_entry(
    entry_id: int,
    db: Session = Depends(get_db),
):
    entry = post_journal_entry(db, entry_id)
    return serialize_entry(entry)