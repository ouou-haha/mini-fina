from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Base      = 所有数据库表模型的基类
# engine    = 数据库连接
# Session   = 一次数据库操作会话
# get_db    = FastAPI 接口里用来拿数据库连接

DATABASE_URL = "sqlite:///./mini_ledger.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()