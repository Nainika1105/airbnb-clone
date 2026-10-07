from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession

from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, create_session, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.AuthResponse)
def signup(payload: schemas.SignupRequest, db: DbSession = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_host=payload.is_host,
        avatar_url=f"https://i.pravatar.cc/150?u={payload.email}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_session(db, user)
    return {"token": token, "user": user}


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: DbSession = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or user.password_hash != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_session(db, user)
    return {"token": token, "user": user}


@router.get("/me", response_model=schemas.UserPublic)
def me(user: models.User = Depends(get_current_user)):
    return user


@router.post("/become-host", response_model=schemas.UserPublic)
def become_host(
    user: models.User = Depends(get_current_user), db: DbSession = Depends(get_db)
):
    user.is_host = True
    db.commit()
    db.refresh(user)
    return user
