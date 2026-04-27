from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class JournalLineCreate(BaseModel):
    account_id: int
    debit: Decimal = Field(default=Decimal("0.00"), ge=0)
    credit: Decimal = Field(default=Decimal("0.00"), ge=0)
    description: Optional[str] = None


class JournalEntryCreate(BaseModel):
    date: date
    description: str
    lines: List[JournalLineCreate]