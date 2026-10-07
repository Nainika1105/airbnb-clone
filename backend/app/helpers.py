from sqlalchemy.orm import Session as DbSession

from . import models


def listing_rating(listing: models.Listing) -> tuple[float | None, int]:
    reviews = listing.reviews
    if not reviews:
        return None, 0
    avg = sum(r.rating for r in reviews) / len(reviews)
    return round(avg, 2), len(reviews)


def favorite_listing_ids(db: DbSession, user: models.User | None) -> set[int]:
    if not user:
        return set()
    rows = db.query(models.WishlistItem.listing_id).filter(
        models.WishlistItem.user_id == user.id
    ).all()
    return {r[0] for r in rows}


def to_card(listing: models.Listing, fav_ids: set[int]) -> dict:
    rating, count = listing_rating(listing)
    return {
        "id": listing.id,
        "title": listing.title,
        "city": listing.city,
        "country": listing.country,
        "category": listing.category,
        "property_type": listing.property_type,
        "price_per_night": listing.price_per_night,
        "rating": rating,
        "review_count": count,
        "images": [img.url for img in listing.images],
        "host_name": listing.host.name,
        "is_superhost": listing.host.is_superhost,
        "is_favorite": listing.id in fav_ids,
        "lat": listing.lat,
        "lng": listing.lng,
        "max_guests": listing.max_guests,
    }


SERVICE_FEE_RATE = 0.14


def compute_quote(listing: models.Listing, nights: int) -> dict:
    subtotal = listing.price_per_night * nights
    service_fee = round(subtotal * SERVICE_FEE_RATE, 2)
    total = round(subtotal + listing.cleaning_fee + service_fee, 2)
    return {
        "nights": nights,
        "nightly_rate": listing.price_per_night,
        "subtotal": round(subtotal, 2),
        "cleaning_fee": listing.cleaning_fee,
        "service_fee": service_fee,
        "total": total,
    }
