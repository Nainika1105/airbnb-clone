from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import (
    auth_router,
    listings_router,
    bookings_router,
    host_router,
    wishlist_router,
    reviews_router,
)

Base.metadata.create_all(bind=engine)

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
