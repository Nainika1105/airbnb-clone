from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=schemas.ReviewOut, status_code=201)
def create_review(
    payload: schemas.ReviewCreate,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Only guests with a completed stay can review (bonus feature)
    completed_stay = (
        db.query(models.Booking)
        .filter(
            models.Booking.listing_id == payload.listing_id,
            models.Booking.guest_id == user.id,
            models.Booking.status == "confirmed",
            models.Booking.check_out <= date.today(),
        )
        .first()
    )
    if not completed_stay:
        raise HTTPException(
            status_code=403, detail="You can only review places you have stayed at"
        )

    existing = (
        db.query(models.Review)
        .filter(
            models.Review.listing_id == payload.listing_id,
            models.Review.author_id == user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already reviewed this place")

    review = models.Review(
        listing_id=payload.listing_id,
        author_id=user.id,
        rating=payload.rating,
        cleanliness=payload.cleanliness,
        accuracy=payload.accuracy,
        check_in_rating=payload.check_in_rating,
        communication=payload.communication,
        location_rating=payload.location_rating,
        value=payload.value,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {
        "id": review.id,
        "rating": review.rating,
        "cleanliness": review.cleanliness,
        "accuracy": review.accuracy,
        "check_in_rating": review.check_in_rating,
        "communication": review.communication,
        "location_rating": review.location_rating,
        "value": review.value,
        "comment": review.comment,
        "created_at": review.created_at,
        "author_name": user.name,
        "author_avatar": user.avatar_url,
    }
