from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os

# The DB path defaults to the repo (fine for local dev), but can be pointed at a
# writable location via DATABASE_PATH — required on hosts like Render where the
# source checkout is mounted read-only at runtime (e.g. DATABASE_PATH=/tmp/airbnb.db).
DB_PATH = os.environ.get("DATABASE_PATH") or os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "airbnb.db"
)
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
