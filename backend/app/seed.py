"""Seed the database with demo users, listings, reviews and bookings.

Run from backend/:  python -m app.seed
"""
import random
from datetime import date, datetime, timedelta

from .database import Base, engine, SessionLocal, DB_PATH
from . import models
from .auth import hash_password
from .helpers import compute_quote

random.seed(42)

U = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=1200&q=80"

# Curated photo pools per category (unsplash photo ids)
PHOTOS = {
    "beachfront": [
        "1499793983690-e29da59ef1c2", "1507525428034-b723cf961d3e", "1519046904884-53103b34b206",
        "1510414842594-a61c69b5ae57", "1505228395891-9a51e7e86bf6", "1468413253725-0d5181091126",
        "1509233725247-49e657c54213", "1519821172144-4f87d85de2a2",
    ],
    "cabins": [
        "1449158743715-0a90ebb6d2d8", "1518780664697-55e3ad937233", "1542718610-a1d656d1884c",
        "1510798831971-661eb04b3739", "1587061949409-02df41d5e562", "1521401830884-6c03c1c87ebb",
        "1486915309851-b0cc1f8a0084", "1470770841072-f978cf4d019e",
    ],
    "amazing-views": [
        "1506905925346-21bda4d32df4", "1464822759023-fed622ff2c3b", "1469474968028-56623f02e42e",
        "1454496522488-7a8e488e8606", "1472214103451-9374bd1c798e", "1506744038136-46273834b3fb",
        "1441974231531-c6227db76b6e", "1447752875215-b2761acb3c5d",
    ],
    "design": [
        "1600585154340-be6161a56a0c", "1600596542815-ffad4c1539a9", "1600607687939-ce8a6c25118c",
        "1600566753086-00f18fb6b3ea", "1600607687920-4e2a09cf159d", "1512917774080-9991f1c4c750",
        "1613490493576-7fde63acd811", "1600047509807-ba8f99d2cdde",
    ],
    "countryside": [
        "1500382017468-9049fed747ef", "1501785888041-af3ef285b470", "1465146344425-f00d5f5c8f07",
        "1472396961693-142e6e269027", "1500530855697-b586d89ba3ee", "1416169607655-0c2b3ce2e1cc",
        "1452960962994-acf4fd70b632", "1517022812141-23620dba5c23",
    ],
    "luxe": [
        "1613977257363-707ba9348227", "1613977257592-4871e5fcd7c4", "1512918728675-ed5a9ecdebfd",
        "1571896349842-33c89424de2d", "1582719478250-c89cae4dc85b", "1542314831-068cd1dbfeeb",
        "1566073771259-6a8506099945", "1551882547-ff40c63fe5fa",
    ],
    "tiny-homes": [
        "1587564987541-a0918a7de229", "1595877244574-e90ce41ce089", "1600585154526-990dced4db0d",
        "1570129477492-45c003edd2be", "1568605114967-8130f3a36994", "1583608205776-bfd35f0d9f83",
        "1560184897-ae75f418493e", "1564013799919-ab600027ffc6",
    ],
    "city": [
        "1502672260266-1c1ef2d93688", "1522708323590-d24dbb6b0267", "1536376072261-38c75010e6c9",
        "1493809842364-78817add7ffb", "1554995207-c18c203602cb", "1484154218962-a197022b5858",
        "1493663284031-b7e3aefcae8e", "1499955085172-a104c9463ece",
    ],
}

INTERIOR = [
    "1556228453-efd6c1ff04f6", "1556911220-bff31c812dba", "1556909114-f6e7ad7d3136",
    "1556909172-54557c7e4fb7", "1584622650111-993a426fbf0a", "1552321554-5fefe8c9ef14",
    "1540518614846-7eded433c457", "1522771739844-6a9f6d5f14af", "1505693416388-ac5ce068fe85",
    "1560448204-e02f11c3d0e2", "1560185007-c5ca9d2c014d", "1560185127-6ed189bf02f4",
]

HOSTS = [
    ("Sophia", "sophia@host.com", True),
    ("Marcus", "marcus@host.com", False),
    ("Elena", "elena@host.com", True),
    ("Rajiv", "rajiv@host.com", False),
    ("Camille", "camille@host.com", True),
    ("Diego", "diego@host.com", False),
]

GUESTS = [
    ("Ava Thompson", "ava@guest.com"),
    ("Liam Carter", "liam@guest.com"),
    ("Mia Rodriguez", "mia@guest.com"),
    ("Noah Kim", "noah@guest.com"),
    ("Isla Murphy", "isla@guest.com"),
    ("Ethan Patel", "ethan@guest.com"),
]

AMENITIES = [
    ("Wifi", "wifi"), ("Kitchen", "kitchen"), ("Free parking", "parking"),
    ("Pool", "pool"), ("Hot tub", "hottub"), ("Air conditioning", "ac"),
    ("Heating", "heating"), ("Washer", "washer"), ("Dryer", "dryer"),
    ("TV", "tv"), ("Dedicated workspace", "workspace"), ("Pets allowed", "pets"),
    ("Gym", "gym"), ("BBQ grill", "bbq"), ("Fire pit", "firepit"),
    ("Beach access", "beach"), ("Mountain view", "mountain"), ("Smoke alarm", "smoke"),
    ("First aid kit", "firstaid"), ("Self check-in", "selfcheckin"),
]

LISTINGS = [
    # (title, category, property_type, city, country, lat, lng, price, guests, bd, beds, ba)
    ("Oceanfront villa with infinity pool", "beachfront", "Entire villa", "Malibu", "United States", 34.0259, -118.7798, 589, 8, 4, 5, 3.5),
    ("Beach bungalow steps from the sand", "beachfront", "Entire bungalow", "Tulum", "Mexico", 20.2114, -87.4654, 214, 4, 2, 2, 2),
    ("Cliffside retreat over the Aegean", "beachfront", "Entire home", "Santorini", "Greece", 36.3932, 25.4615, 342, 6, 3, 3, 2),
    ("Surf shack with private beach path", "beachfront", "Entire cottage", "Byron Bay", "Australia", -28.6474, 153.6020, 187, 4, 2, 3, 1),
    ("A-frame cabin in the pines", "cabins", "Entire cabin", "Lake Tahoe", "United States", 39.0968, -120.0324, 245, 6, 3, 4, 2),
    ("Cozy log cabin with wood stove", "cabins", "Entire cabin", "Whistler", "Canada", 50.1163, -122.9574, 198, 4, 2, 2, 1),
    ("Secluded forest cabin & sauna", "cabins", "Entire cabin", "Rovaniemi", "Finland", 66.5039, 25.7294, 176, 4, 2, 2, 1),
    ("Riverside cabin with fire pit", "cabins", "Entire cabin", "Gatlinburg", "United States", 35.7143, -83.5102, 159, 5, 2, 3, 2),
    ("Glass chalet facing the Matterhorn", "amazing-views", "Entire chalet", "Zermatt", "Switzerland", 46.0207, 7.7491, 455, 6, 3, 3, 2.5),
    ("Panoramic penthouse over the fjord", "amazing-views", "Entire rental unit", "Bergen", "Norway", 60.3913, 5.3221, 268, 4, 2, 2, 1.5),
    ("Terraced villa above the Amalfi coast", "amazing-views", "Entire villa", "Positano", "Italy", 40.6281, 14.4850, 512, 7, 4, 4, 3),
    ("Desert dome with stargazing deck", "amazing-views", "Dome", "Joshua Tree", "United States", 34.1347, -116.3131, 221, 2, 1, 1, 1),
    ("Architect-designed concrete house", "design", "Entire home", "Mexico City", "Mexico", 19.4326, -99.1332, 275, 6, 3, 3, 2.5),
    ("Minimalist loft in a converted factory", "design", "Entire loft", "Berlin", "Germany", 52.5200, 13.4050, 189, 3, 1, 2, 1),
    ("Mid-century gem with sculpture garden", "design", "Entire home", "Palm Springs", "United States", 33.8303, -116.5453, 329, 6, 3, 3, 2),
    ("Japandi townhouse near the canal", "design", "Entire townhouse", "Copenhagen", "Denmark", 55.6761, 12.5683, 243, 4, 2, 2, 1.5),
    ("Stone farmhouse among the vineyards", "countryside", "Entire farmhouse", "Tuscany", "Italy", 43.4637, 11.8796, 231, 8, 4, 5, 3),
    ("Lavender farm cottage", "countryside", "Entire cottage", "Provence", "France", 43.8345, 5.7811, 164, 4, 2, 2, 1),
    ("Shepherd's hut on a working farm", "countryside", "Farm stay", "Cotswolds", "United Kingdom", 51.8330, -1.8433, 121, 2, 1, 1, 1),
    ("Hacienda with mountain horse trails", "countryside", "Entire home", "San Miguel de Allende", "Mexico", 20.9144, -100.7452, 203, 6, 3, 4, 2.5),
    ("Marble penthouse with rooftop pool", "luxe", "Entire penthouse", "Dubai", "United Arab Emirates", 25.2048, 55.2708, 899, 8, 4, 4, 4.5),
    ("Private island villa with chef", "luxe", "Entire villa", "Bora Bora", "French Polynesia", -16.5004, -151.7415, 1250, 10, 5, 6, 5),
    ("Historic palazzo suite on the canal", "luxe", "Entire rental unit", "Venice", "Italy", 45.4408, 12.3155, 678, 4, 2, 2, 2),
    ("Designer tiny house on wheels", "tiny-homes", "Tiny home", "Portland", "United States", 45.5152, -122.6784, 98, 2, 1, 1, 1),
    ("Micro cabin with a big view", "tiny-homes", "Tiny home", "Queenstown", "New Zealand", -45.0312, 168.6626, 112, 2, 1, 1, 1),
    ("Container home in the olive grove", "tiny-homes", "Tiny home", "Alentejo", "Portugal", 38.0000, -8.0000, 104, 3, 1, 2, 1),
    ("Sunny flat near the Eiffel Tower", "city", "Entire rental unit", "Paris", "France", 48.8566, 2.3522, 247, 3, 1, 2, 1),
    ("Brooklyn brownstone with garden", "city", "Entire home", "New York", "United States", 40.6782, -73.9442, 312, 6, 3, 3, 2),
    ("Shibuya skyline studio", "city", "Entire rental unit", "Tokyo", "Japan", 35.6595, 139.7005, 156, 2, 1, 1, 1),
    ("Gaudí-district balcony apartment", "city", "Entire rental unit", "Barcelona", "Spain", 41.3874, 2.1686, 178, 4, 2, 2, 1.5),
]

REVIEW_COMMENTS = [
    "Absolutely stunning place. The photos don't do it justice — we didn't want to leave!",
    "Great location and spotless. Host was super responsive and check-in was a breeze.",
    "One of the best stays we've ever had. The view from the living room is unreal.",
    "Beautifully designed and very comfortable. Would definitely stay again.",
    "Everything was exactly as described. The kitchen was fully stocked and the beds are so comfy.",
    "Perfect weekend getaway. Quiet, private, and the host's recommendations were spot on.",
    "Lovely home with tons of character. A short walk to restaurants and cafes.",
    "The space is gorgeous and immaculate. Communication was quick and friendly.",
    "We celebrated an anniversary here and it was magical. Highly recommend.",
    "Fantastic value for the price. Great wifi, worked remotely without any issues.",
    "The host thought of everything — welcome snacks, local tips, beach gear. 10/10.",
    "Such a peaceful spot. We loved morning coffee on the deck.",
]


def seed():
    import os
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Users ---
    demo_guest = models.User(
        name="Demo Guest", email="guest@demo.com",
        password_hash=hash_password("password"),
        avatar_url="https://i.pravatar.cc/150?u=guest@demo.com", is_host=False,
    )
    demo_host = models.User(
        name="Demo Host", email="host@demo.com",
        password_hash=hash_password("password"),
        avatar_url="https://i.pravatar.cc/150?u=host@demo.com",
        is_host=True, is_superhost=True,
    )
    db.add_all([demo_guest, demo_host])

    hosts = []
    for name, email, superhost in HOSTS:
        h = models.User(
            name=name, email=email, password_hash=hash_password("password"),
            avatar_url=f"https://i.pravatar.cc/150?u={email}",
            is_host=True, is_superhost=superhost,
            created_at=datetime.utcnow() - timedelta(days=random.randint(400, 2200)),
        )
        hosts.append(h)
    db.add_all(hosts)

    guests = []
    for name, email in GUESTS:
        g = models.User(
            name=name, email=email, password_hash=hash_password("password"),
            avatar_url=f"https://i.pravatar.cc/150?u={email}", is_host=False,
        )
        guests.append(g)
    db.add_all(guests)
    db.flush()

    # --- Amenities ---
    amenities = [models.Amenity(name=n, icon=i) for n, i in AMENITIES]
    db.add_all(amenities)
    db.flush()

    # --- Listings ---
    all_listings = []
    for idx, row in enumerate(LISTINGS):
        (title, category, ptype, city, country, lat, lng, price, max_g, bd, beds, ba) = row
        host = hosts[idx % len(hosts)] if idx % 5 != 0 else demo_host
        listing = models.Listing(
            host_id=host.id, title=title,
            description=(
                f"Welcome to {title.lower()}! This {ptype.lower()} in {city} sleeps "
                f"{max_g} guests across {bd} bedroom(s) and {beds} bed(s).\n\n"
                "The space has been thoughtfully furnished with everything you need for a "
                "relaxing stay — a fully equipped kitchen, fast wifi, premium linens and "
                "plenty of natural light. Step outside and you're minutes away from the "
                f"best that {city} has to offer.\n\n"
                "Guests have access to the entire place. I'm always available by message "
                "if you need local tips or anything during your stay. Self check-in with "
                "a smart lock makes arrival easy at any hour."
            ),
            property_type=ptype, category=category, city=city, country=country,
            lat=lat, lng=lng, price_per_night=price,
            cleaning_fee=round(price * 0.12),
            max_guests=max_g, bedrooms=bd, beds=beds, baths=ba,
            created_at=datetime.utcnow() - timedelta(days=random.randint(60, 700)),
        )
        cat_photos = PHOTOS[category]
        cover = cat_photos[idx % len(cat_photos)]
        extra = random.sample(INTERIOR, 4)
        for pos, pid in enumerate([cover] + extra):
            listing.images.append(models.ListingImage(url=U.format(pid), position=pos))
        listing.amenities = random.sample(amenities, random.randint(6, 12))
        all_listings.append(listing)
    db.add_all(all_listings)
    db.flush()

    # --- Reviews ---
    for listing in all_listings:
        for _ in range(random.randint(3, 9)):
            author = random.choice(guests + [demo_guest])
            base = random.choice([4.0, 4.5, 4.5, 5.0, 5.0, 5.0, 3.5])
            db.add(models.Review(
                listing_id=listing.id, author_id=author.id,
                rating=base,
                cleanliness=min(5, base + random.choice([0, 0.5])),
                accuracy=min(5, base + random.choice([0, 0.5])),
                check_in_rating=min(5, base + random.choice([0, 0.5])),
                communication=min(5, base + random.choice([0, 0.5])),
                location_rating=min(5, base + random.choice([0, 0.5])),
                value=max(1, base - random.choice([0, 0.5])),
                comment=random.choice(REVIEW_COMMENTS),
                created_at=datetime.utcnow() - timedelta(days=random.randint(5, 400)),
            ))

    # --- Bookings: some past (so demo guest can review), some upcoming ---
    today = date.today()

    booked: dict[int, list[tuple[date, date]]] = {}

    def add_booking(listing, guest, start_offset, nights, guests_count=2):
        check_in = today + timedelta(days=start_offset)
        check_out = check_in + timedelta(days=nights)
        for (s, e) in booked.get(listing.id, []):
            if check_in < e and check_out > s:
                return  # skip overlapping seed bookings
        booked.setdefault(listing.id, []).append((check_in, check_out))
        q = compute_quote(listing, nights)
        db.add(models.Booking(
            listing_id=listing.id, guest_id=guest.id,
            check_in=check_in, check_out=check_out,
            guests=min(guests_count, listing.max_guests),
            nightly_rate=q["nightly_rate"], cleaning_fee=q["cleaning_fee"],
            service_fee=q["service_fee"], total_price=q["total"],
            status="confirmed",
            created_at=datetime.utcnow() - timedelta(days=max(0, -start_offset + 10)),
        ))

    # Demo guest: one past trip, two upcoming
    add_booking(all_listings[0], demo_guest, -40, 5, 2)
    add_booking(all_listings[4], demo_guest, 14, 4, 3)
    add_booking(all_listings[26], demo_guest, 45, 6, 2)

    # Other guests book around (creates blocked dates + host dashboard data)
    for i, listing in enumerate(all_listings):
        if i % 2 == 0:
            add_booking(listing, random.choice(guests), random.randint(5, 60), random.randint(2, 7))
        if i % 3 == 0:
            add_booking(listing, random.choice(guests), -random.randint(15, 90), random.randint(2, 6))

    db.commit()
    db.close()
    print(f"Seeded database at {DB_PATH}")
    print("Demo accounts: guest@demo.com / password  |  host@demo.com / password")


if __name__ == "__main__":
    seed()
