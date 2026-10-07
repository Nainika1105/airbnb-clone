from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession, joinedload

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..helpers import to_card, favorite_listing_ids
from .bookings_router import _booking_out

router = APIRouter(prefix="/api/host", tags=["host"])


@router.get("/listings", response_model=list[schemas.ListingCard])
def my_listings(
    db: DbSession = Depends(get_db), user: models.User = Depends(get_current_user)
):
    listings = (
        db.query(models.Listing)
        .options(
            joinedload(models.Listing.images),
            joinedload(models.Listing.host),
            joinedload(models.Listing.reviews),
        )
        .filter(models.Listing.host_id == user.id)
        .order_by(models.Listing.created_at.desc())
        .all()
    )
    fav_ids = favorite_listing_ids(db, user)
    return [to_card(l, fav_ids) for l in listings]


@router.get("/bookings", response_model=list[schemas.BookingOut])
def bookings_on_my_listings(
    db: DbSession = Depends(get_db), user: models.User = Depends(get_current_user)
):
    bookings = (
        db.query(models.Booking)
        .join(models.Listing, models.Booking.listing_id == models.Listing.id)
        .options(
            joinedload(models.Booking.listing).joinedload(models.Listing.images),
            joinedload(models.Booking.listing).joinedload(models.Listing.host),
            joinedload(models.Booking.guest),
        )
        .filter(models.Listing.host_id == user.id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    return [_booking_out(b) for b in bookings]
