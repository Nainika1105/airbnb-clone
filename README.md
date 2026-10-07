# Airbnb Clone — SDE Fullstack Assignment

A functional clone of the Airbnb web application: browse and search property listings, view listing details, book stays for a date range (with availability validation), and host your own listings — all in a UI closely modeled on the real Airbnb.

**Demo accounts** (seeded):

| Role  | Email            | Password   |
| ----- | ---------------- | ---------- |
| Guest | `guest@demo.com` | `password` |
| Host  | `host@demo.com`  | `password` |

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · react-day-picker · react-hot-toast
- **Backend:** Python · FastAPI · SQLAlchemy 2.0 · Pydantic v2
- **Database:** SQLite (schema designed from scratch, seeded with sample data)

## Setup Instructions

### 1. Backend (http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed          # creates + seeds airbnb.db (30 listings, users, reviews, bookings)
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

### 2. Frontend (http://localhost:3000)

```bash
cd frontend
npm install
npm run dev
```

The frontend reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

---

## Features

### Core
- **Home & Search** — Airbnb-style explore grid (photo carousel cards with rating, price/night, superhost badge), pill search bar (location + date range + guests), category row with icons, filters modal (price range, bedrooms, property type, amenities), infinite scroll.
- **Listing detail** — 5-photo gallery grid with "show all photos" modal, title/description/amenities/host info, availability calendar with booked dates disabled, live price breakdown (nightly × nights + cleaning fee + 14% service fee), reviews with Airbnb's six-category rating bars, embedded OpenStreetMap.
- **Booking flow** — date-range + guest validation (no overlapping or past dates, guest cap), mocked checkout page with price details, confirmation screen, **My Trips** view (upcoming/past, cancel upcoming trips). Bookings persist and block those dates for everyone else.
- **Host experience** — full CRUD for listings (create/edit/delete with photos via URL, amenities, pricing), host dashboard with stats, listings list and a reservations table of guest bookings. Ownership is enforced server-side.
- **Extras** — wishlist/favorites (heart toggle, wishlist page), leave-a-review after a completed stay (server verifies the stay), superhost badges, rating aggregation, toasts, auth modal, responsive layout.

### Simplified / mocked (as allowed by the brief)
- Payments — mocked checkout form, no real processing.
- Auth — email/password with hashed passwords + bearer session tokens (simple but real guest/host separation).
- Map — embedded OpenStreetMap (no API key needed).
- Messaging / identity verification — out of scope.

---

## Architecture Overview

```
scaler/
├── backend/
│   └── app/
│       ├── main.py        # FastAPI app, CORS, router registration
│       ├── database.py    # SQLAlchemy engine/session (SQLite)
│       ├── models.py      # ORM models (schema below)
│       ├── schemas.py     # Pydantic request/response models
│       ├── auth.py        # password hashing, session tokens, auth dependencies
│       ├── helpers.py     # card serialization, rating aggregation, price quotes
│       ├── seed.py        # demo data seeder
│       └── routers/       # auth, listings (search/detail/CRUD), bookings,
│                          # host dashboard, wishlist, reviews
└── frontend/
    └── src/
        ├── app/           # routes: / (explore), /rooms/[id], /book/[id],
        │                  # /trips, /wishlists, /hosting(+new/edit)
        ├── components/    # Navbar, SearchPanel, CategoryBar, FiltersModal,
        │                  # ListingCard, PhotoGallery, BookingWidget,
        │                  # ReviewsSection, ListingForm, modals…
        ├── context/       # AuthContext (user state + auth modal)
        └── lib/           # typed API client, shared TS types
```

- The frontend is a pure API client (no Next.js server data fetching) — clean separation; the backend is independently usable (see `/docs`).
- Availability is enforced in one place: a booking conflicts when `existing.check_in < new.check_out AND existing.check_out > new.check_in` (confirmed bookings only). The same predicate powers date-filtered search, the disabled calendar ranges, and booking creation.
- Pricing is computed server-side (`quote` endpoint) and mirrored client-side for instant UI feedback.

## Database Schema

```
users            id, name, email (unique), password_hash, avatar_url,
                 is_host, is_superhost, created_at
sessions         token (PK), user_id → users
listings         id, host_id → users, title, description, property_type,
                 category, city, country, lat, lng, price_per_night,
                 cleaning_fee, max_guests, bedrooms, beds, baths, created_at
listing_images   id, listing_id → listings (cascade), url, position
amenities        id, name (unique), icon
listing_amenities (listing_id, amenity_id)  — many-to-many join
bookings         id, listing_id → listings, guest_id → users, check_in,
                 check_out, guests, nightly_rate, cleaning_fee, service_fee,
                 total_price, status (confirmed|cancelled), created_at
reviews          id, listing_id → listings, author_id → users, rating +
                 6 category ratings (cleanliness, accuracy, check-in,
                 communication, location, value), comment, created_at
wishlist_items   id, user_id → users, listing_id → listings,
                 UNIQUE(user_id, listing_id)
```

Relationships: a user has many listings (as host), bookings (as guest), reviews and wishlist items; a listing has many images, bookings, reviews and amenities (M2M). Deleting a listing cascades to its images/bookings/reviews.

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` / `login` | Create account / log in → `{token, user}` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/listings` | Search: `location, check_in, check_out, guests, category, property_type, price_min/max, bedrooms, amenities, page, page_size` |
| GET | `/api/listings/{id}` | Detail: images, amenities, host, reviews, rating breakdown, booked date ranges |
| POST/PUT/DELETE | `/api/listings[/{id}]` | Host CRUD (owner-only) |
| GET | `/api/listings/amenities` | Amenity catalog |
| GET | `/api/bookings/quote` | Price quote for a date range |
| POST | `/api/bookings` | Book (validates dates, overlap, guest count) |
| GET | `/api/bookings/mine` | My trips |
| POST | `/api/bookings/{id}/cancel` | Cancel an upcoming trip |
| GET | `/api/host/listings` / `bookings` | Host dashboard data |
| GET/POST | `/api/wishlist`, `/api/wishlist/{id}/toggle` | Wishlist |
| POST | `/api/reviews` | Review (requires a completed stay) |

## Assumptions

- A "session token" auth scheme (opaque token in `Authorization: Bearer`) is sufficient per the brief's simplified-auth allowance; passwords are salted-hashed.
- Service fee is a flat 14% of the subtotal (approximating Airbnb's guest fee).
- Checkout day is treated as available for a new check-in (like real Airbnb).
- Listing photos are added by URL (cloud upload was optional/bonus).
- Any user can become a host by creating a listing (mirrors Airbnb's flow).

## AI Tools Usage

Built with heavy use of Claude (Anthropic) as allowed by the brief; every line has been reviewed and I can explain all implementation decisions.
