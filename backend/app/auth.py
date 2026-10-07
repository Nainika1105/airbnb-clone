import hashlib
import secrets

from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session as DbSession

from .database import get_db
from . import models

SALT = "airbnb-clone-static-salt"  # simplified auth per assignment; not production-grade


def hash_password(password: str) -> str:
    return hashlib.sha256((SALT + password).encode()).hexdigest()


def create_session(db: DbSession, user: models.User) -> str:
    token = secrets.token_hex(32)
    db.add(models.Session(token=token, user_id=user.id))
    db.commit()
    return token


def _user_from_token(db: DbSession, authorization: str | None) -> models.User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    session = db.get(models.Session, token)
    return session.user if session else None


def get_current_user(
    authorization: str | None = Header(default=None),
    db: DbSession = Depends(get_db),
) -> models.User:
    user = _user_from_token(db, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def get_optional_user(
    authorization: str | None = Header(default=None),
    db: DbSession = Depends(get_db),
) -> models.User | None:
    return _user_from_token(db, authorization)
