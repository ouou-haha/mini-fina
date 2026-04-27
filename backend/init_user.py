from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.core.auth import get_password_hash


def init_user():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    username = "admin"
    password = "123456"

    existing = db.query(User).filter(User.username == username).first()

    if existing:
        print("Admin user already exists.")
        db.close()
        return

    user = User(
        username=username,
        hashed_password=get_password_hash(password),
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.close()

    print("Admin user created.")
    print("username: admin")
    print("password: 123456")


if __name__ == "__main__":
    init_user()