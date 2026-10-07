from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession, joinedload

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..helpers import compute_quote

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _booking_out(b: models.Booking) -> dict:
    return {
        "id": b.id,
        "listing_id": b.listing_id,
        "listing_title": b.listing.title,
        "listing_city": b.listing.city,
        "listing_country": b.listing.country,
        "listing_image": b.listing.images[0].url if b.listing.images else "",
        "host_name": b.listing.host.name,
        "check_in": b.check_in,
        "check_out": b.check_out,
        "guests": b.guests,
        "nightly_rate": b.nightly_rate,
        "cleaning_fee": b.cleaning_fee,
        "service_fee": b.service_fee,
        "total_price": b.total_price,
        "status": b.status,
        "created_at": b.created_at,
        "guest_name": b.guest.name,
    }


def _has_conflict(db: DbSession, listing_id: int, check_in: date, check_out: date) -> bool:
    return (
        db.query(models.Booking)
        .filter(
            models.Booking.listing_id == listing_id,
            models.Booking.status == "confirmed",
            models.Booking.check_in < check_out,
            models.Booking.check_out > check_in,
        )
        .first()
        is not None
    )


@router.get("/quote", response_model=schemas.BookingQuote)
def quote(
    listing_id: int,
    check_in: date,
    check_out: date,
    db: DbSession = Depends(get_db),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    nights = (check_out - check_in).days
    if nights < 1:
        raise HTTPException(status_code=422, detail="Stay must be at least one night")
    return compute_quote(listing, nights)


@router.post("", response_model=schemas.BookingOut, status_code=201)
def create_booking(
    payload: schemas.BookingCreate,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    nights = (payload.check_out - payload.check_in).days
    if nights < 1:
        raise HTTPException(status_code=422, detail="Stay must be at least one night")
    if payload.check_in < date.today():
        raise HTTPException(status_code=422, detail="Check-in date cannot be in the past")
    if payload.guests > listing.max_guests:
        raise HTTPException(
            status_code=422,
            detail=f"This place accommodates a maximum of {listing.max_guests} guests",
        )
    if listing.host_id == user.id:
        raise HTTPException(status_code=422, detail="You cannot book your own listing")
    if _has_conflict(db, listing.id, payload.check_in, payload.check_out):
        raise HTTPException(
            status_code=409, detail="Those dates are no longer available"
        )

    q = compute_quote(listing, nights)
    booking = models.Booking(
        listing_id=listing.id,
        guest_id=user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nightly_rate=q["nightly_rate"],
        cleaning_fee=q["cleaning_fee"],
        service_fee=q["service_fee"],
        total_price=q["total"],
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _booking_out(booking)


@router.get("/mine", response_model=list[schemas.BookingOut])
def my_trips(
    db: DbSession = Depends(get_db), user: models.User = Depends(get_current_user)
):
    bookings = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.listing).joinedload(models.Listing.images),
            joinedload(models.Booking.listing).joinedload(models.Listing.host),
            joinedload(models.Booking.guest),
        )
        .filter(models.Booking.guest_id == user.id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    return [_booking_out(b) for b in bookings]


@router.get("/{booking_id}", response_model=schemas.BookingOut)
def get_booking(
    booking_id: int,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    booking = db.get(models.Booking, booking_id)
    if not booking or (
        booking.guest_id != user.id and booking.listing.host_id != user.id
    ):
        raise HTTPException(status_code=404, detail="Booking not found")
    return _booking_out(booking)


@router.post("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(
    booking_id: int,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    booking = db.get(models.Booking, booking_id)
    if not booking or booking.guest_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.check_in <= date.today():
        raise HTTPException(status_code=422, detail="This trip can no longer be cancelled")
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return _booking_out(booking)
