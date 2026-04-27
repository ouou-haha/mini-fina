from fastapi import FastAPI

from app.database import Base, engine
from app.models.account import Account
from app.routers.accounts import router as accounts_router
from app.models.journal import JournalEntry, JournalLine
from app.routers.journals import router as journals_router
from app.routers.reports import router as reports_router
from fastapi.middleware.cors import CORSMiddleware
from app.models.user import User
from app.routers.auth import router as auth_router

app = FastAPI(title="MiniLedger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "MiniLedger is running"
    }


app.include_router(accounts_router)
app.include_router(journals_router)
app.include_router(reports_router)
app.include_router(auth_router)