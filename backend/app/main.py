from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from . import models
from .routers import (
    auth_router,
    listings_router,
    bookings_router,
    host_router,
    wishlist_router,
    reviews_router,
)

Base.metadata.create_all(bind=engine)


def _seed_if_empty():
    """On a fresh deploy the DB is empty — populate it with demo data."""
    db = SessionLocal()
    try:
        has_data = db.query(models.Listing.id).first() is not None
    finally:
        db.close()
    if not has_data:
        from .seed import seed

        seed(reset=False)


_seed_if_empty()

app = FastAPI(title="Airbnb Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(listings_router.router)
app.include_router(bookings_router.router)
app.include_router(host_router.router)
app.include_router(wishlist_router.router)
app.include_router(reviews_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
