from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import Session as DbSession, joinedload

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, get_optional_user
from ..helpers import to_card, favorite_listing_ids, listing_rating

router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.get("/amenities", response_model=list[schemas.AmenityOut])
def list_amenities(db: DbSession = Depends(get_db)):
    return db.query(models.Amenity).order_by(models.Amenity.name).all()


@router.get("", response_model=schemas.ListingPage)
def search_listings(
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = None,
    category: str | None = None,
    property_type: str | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    amenities: str | None = Query(default=None, description="comma-separated amenity ids"),
    bedrooms: int | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    db: DbSession = Depends(get_db),
    user: models.User | None = Depends(get_optional_user),
):
    q = db.query(models.Listing).options(
        joinedload(models.Listing.images),
        joinedload(models.Listing.host),
        joinedload(models.Listing.reviews),
    )

    if location:
        like = f"%{location.strip()}%"
        q = q.filter(
            or_(
                models.Listing.city.ilike(like),
                models.Listing.country.ilike(like),
                models.Listing.title.ilike(like),
            )
        )
    if guests:
        q = q.filter(models.Listing.max_guests >= guests)
    if category and category != "all":
        q = q.filter(models.Listing.category == category)
    if property_type:
        q = q.filter(models.Listing.property_type == property_type)
    if price_min is not None:
        q = q.filter(models.Listing.price_per_night >= price_min)
    if price_max is not None:
        q = q.filter(models.Listing.price_per_night <= price_max)
    if bedrooms:
        q = q.filter(models.Listing.bedrooms >= bedrooms)
    if amenities:
        ids = [int(a) for a in amenities.split(",") if a.strip().isdigit()]
        for aid in ids:
            q = q.filter(models.Listing.amenities.any(models.Amenity.id == aid))

    # Exclude listings with a confirmed booking overlapping the requested dates
    if check_in and check_out:
        if check_out <= check_in:
            raise HTTPException(status_code=422, detail="check_out must be after check_in")
        conflict = (
            db.query(models.Booking.listing_id)
            .filter(
                models.Booking.status == "confirmed",
                models.Booking.check_in < check_out,
                models.Booking.check_out > check_in,
            )
            .subquery()
        )
        q = q.filter(~models.Listing.id.in_(conflict))

    total = q.distinct().count()
    listings = (
        q.order_by(models.Listing.id)
        .distinct()
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    fav_ids = favorite_listing_ids(db, user)
    items = [to_card(l, fav_ids) for l in listings]
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": page * page_size < total,
    }


@router.get("/{listing_id}", response_model=schemas.ListingDetail)
def get_listing(
    listing_id: int,
    db: DbSession = Depends(get_db),
    user: models.User | None = Depends(get_optional_user),
):
    listing = (
        db.query(models.Listing)
        .options(
            joinedload(models.Listing.images),
            joinedload(models.Listing.host),
            joinedload(models.Listing.amenities),
            joinedload(models.Listing.reviews).joinedload(models.Review.author),
        )
        .filter(models.Listing.id == listing_id)
        .first()
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    rating, count = listing_rating(listing)
    reviews = listing.reviews
    breakdown_keys = [
        ("cleanliness", "cleanliness"),
        ("accuracy", "accuracy"),
        ("check_in", "check_in_rating"),
        ("communication", "communication"),
        ("location", "location_rating"),
        ("value", "value"),
    ]
    breakdown = {}
    if reviews:
        for label, attr in breakdown_keys:
            breakdown[label] = round(sum(getattr(r, attr) for r in reviews) / len(reviews), 1)

    today = date.today()
    booked = [
        (b.check_in, b.check_out)
        for b in listing.bookings
        if b.status == "confirmed" and b.check_out >= today
    ]

    host_listing_count = (
        db.query(func.count(models.Listing.id))
        .filter(models.Listing.host_id == listing.host_id)
        .scalar()
    )
    host_review_count = (
        db.query(func.count(models.Review.id))
        .join(models.Listing, models.Review.listing_id == models.Listing.id)
        .filter(models.Listing.host_id == listing.host_id)
        .scalar()
    )

    fav_ids = favorite_listing_ids(db, user)

    return {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "property_type": listing.property_type,
        "category": listing.category,
        "city": listing.city,
        "country": listing.country,
        "lat": listing.lat,
        "lng": listing.lng,
        "price_per_night": listing.price_per_night,
        "cleaning_fee": listing.cleaning_fee,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "baths": listing.baths,
        "images": listing.images,
        "amenities": listing.amenities,
        "host": listing.host,
        "host_listing_count": host_listing_count,
        "host_review_count": host_review_count,
        "rating": rating,
        "review_count": count,
        "rating_breakdown": breakdown,
        "reviews": [
            {
                "id": r.id,
                "rating": r.rating,
                "cleanliness": r.cleanliness,
                "accuracy": r.accuracy,
                "check_in_rating": r.check_in_rating,
                "communication": r.communication,
                "location_rating": r.location_rating,
                "value": r.value,
                "comment": r.comment,
                "created_at": r.created_at,
                "author_name": r.author.name,
                "author_avatar": r.author.avatar_url,
            }
            for r in sorted(reviews, key=lambda r: r.created_at, reverse=True)
        ],
        "booked_ranges": booked,
        "is_favorite": listing.id in fav_ids,
    }


def _apply_listing_payload(
    db: DbSession, listing: models.Listing, payload: schemas.ListingCreate
):
    for field in [
        "title", "description", "property_type", "category", "city", "country",
        "lat", "lng", "price_per_night", "cleaning_fee", "max_guests",
        "bedrooms", "beds", "baths",
    ]:
        setattr(listing, field, getattr(payload, field))

    listing.images.clear()
    for i, url in enumerate(payload.image_urls):
        listing.images.append(models.ListingImage(url=url, position=i))

    amenities = (
        db.query(models.Amenity).filter(models.Amenity.id.in_(payload.amenity_ids)).all()
        if payload.amenity_ids
        else []
    )
    listing.amenities = amenities


@router.post("", response_model=schemas.ListingDetail, status_code=201)
def create_listing(
    payload: schemas.ListingCreate,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not user.is_host:
        user.is_host = True  # becoming a host by listing, like Airbnb
    listing = models.Listing(host_id=user.id)
    _apply_listing_payload(db, listing, payload)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return get_listing(listing.id, db, user)


@router.put("/{listing_id}", response_model=schemas.ListingDetail)
def update_listing(
    listing_id: int,
    payload: schemas.ListingUpdate,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")
    _apply_listing_payload(db, listing, payload)
    db.commit()
    return get_listing(listing_id, db, user)


@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    db.delete(listing)
    db.commit()
