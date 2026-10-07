from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DbSession, joinedload

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..helpers import to_card

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=list[schemas.ListingCard])
def my_wishlist(
    db: DbSession = Depends(get_db), user: models.User = Depends(get_current_user)
):
    items = (
        db.query(models.WishlistItem)
        .options(
            joinedload(models.WishlistItem.listing).joinedload(models.Listing.images),
            joinedload(models.WishlistItem.listing).joinedload(models.Listing.host),
            joinedload(models.WishlistItem.listing).joinedload(models.Listing.reviews),
        )
        .filter(models.WishlistItem.user_id == user.id)
        .order_by(models.WishlistItem.created_at.desc())
        .all()
    )
    fav_ids = {i.listing_id for i in items}
    return [to_card(i.listing, fav_ids) for i in items]


@router.post("/{listing_id}/toggle")
def toggle_wishlist(
    listing_id: int,
    db: DbSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    listing = db.get(models.Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    existing = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == user.id,
            models.WishlistItem.listing_id == listing_id,
        )
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"is_favorite": False}
    db.add(models.WishlistItem(user_id=user.id, listing_id=listing_id))
    db.commit()
    return {"is_favorite": True}
