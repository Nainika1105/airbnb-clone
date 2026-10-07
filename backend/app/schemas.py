from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Users / Auth ----------

class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    avatar_url: str
    is_host: bool
    is_superhost: bool
    created_at: datetime


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=4)
    is_host: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


# ---------- Amenities / Images ----------

class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


# ---------- Listings ----------

class ListingCard(BaseModel):
    """Compact shape for grid cards."""
    id: int
    title: str
    city: str
    country: str
    category: str
    property_type: str
    price_per_night: float
    rating: float | None
    review_count: int
    images: list[str]
    host_name: str
    is_superhost: bool
    is_favorite: bool = False
    lat: float
    lng: float
    max_guests: int


class ListingPage(BaseModel):
    items: list[ListingCard]
    total: int
    page: int
    page_size: int
    has_more: bool


class HostInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str
    is_superhost: bool
    created_at: datetime


class ReviewOut(BaseModel):
    id: int
    rating: float
    cleanliness: float
    accuracy: float
    check_in_rating: float
    communication: float
    location_rating: float
    value: float
    comment: str
    created_at: datetime
    author_name: str
    author_avatar: str


class ListingDetail(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    category: str
    city: str
    country: str
    lat: float
    lng: float
    price_per_night: float
    cleaning_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    baths: float
    images: list[ImageOut]
    amenities: list[AmenityOut]
    host: HostInfo
    host_listing_count: int
    host_review_count: int
    rating: float | None
    review_count: int
    rating_breakdown: dict[str, float]
    reviews: list[ReviewOut]
    booked_ranges: list[tuple[date, date]]
    is_favorite: bool = False


class ListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    property_type: str
    category: str
    city: str
    country: str
    lat: float = 0.0
    lng: float = 0.0
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = Field(ge=0, default=0)
    max_guests: int = Field(ge=1, le=16)
    bedrooms: int = Field(ge=0, le=20)
    beds: int = Field(ge=1, le=30)
    baths: float = Field(ge=0.5, le=20)
    image_urls: list[str] = Field(min_length=1)
    amenity_ids: list[int] = []


class ListingUpdate(ListingCreate):
    pass


# ---------- Bookings ----------

class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1)


class BookingQuote(BaseModel):
    nights: int
    nightly_rate: float
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total: float


class BookingOut(BaseModel):
    id: int
    listing_id: int
    listing_title: str
    listing_city: str
    listing_country: str
    listing_image: str
    host_name: str
    check_in: date
    check_out: date
    guests: int
    nightly_rate: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime
    guest_name: str = ""


# ---------- Reviews ----------

class ReviewCreate(BaseModel):
    listing_id: int
    rating: float = Field(ge=1, le=5)
    cleanliness: float = Field(ge=1, le=5, default=5)
    accuracy: float = Field(ge=1, le=5, default=5)
    check_in_rating: float = Field(ge=1, le=5, default=5)
    communication: float = Field(ge=1, le=5, default=5)
    location_rating: float = Field(ge=1, le=5, default=5)
    value: float = Field(ge=1, le=5, default=5)
    comment: str = Field(min_length=3)
