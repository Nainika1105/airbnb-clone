export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_host: boolean;
  is_superhost: boolean;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  category: string;
  property_type: string;
  price_per_night: number;
  rating: number | null;
  review_count: number;
  images: string[];
  host_name: string;
  is_superhost: boolean;
  is_favorite: boolean;
  lat: number;
  lng: number;
  max_guests: number;
}

export interface ListingPage {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface Review {
  id: number;
  rating: number;
  cleanliness: number;
  accuracy: number;
  check_in_rating: number;
  communication: number;
  location_rating: number;
  value: number;
  comment: string;
  created_at: string;
  author_name: string;
  author_avatar: string;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  images: { id: number; url: string; position: number }[];
  amenities: Amenity[];
  host: {
    id: number;
    name: string;
    avatar_url: string;
    is_superhost: boolean;
    created_at: string;
  };
  host_listing_count: number;
  host_review_count: number;
  rating: number | null;
  review_count: number;
  rating_breakdown: Record<string, number>;
  reviews: Review[];
  booked_ranges: [string, string][];
  is_favorite: boolean;
}

export interface BookingQuote {
  nights: number;
  nightly_rate: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_city: string;
  listing_country: string;
  listing_image: string;
  host_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_rate: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string;
  guest_name: string;
}

export interface ListingInput {
  title: string;
  description: string;
  property_type: string;
  category: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  image_urls: string[];
  amenity_ids: number[];
}

export const CATEGORIES = [
  { key: "all", label: "All", icon: "🏠" },
  { key: "beachfront", label: "Beachfront", icon: "🏖️" },
  { key: "cabins", label: "Cabins", icon: "🛖" },
  { key: "amazing-views", label: "Amazing views", icon: "🏔️" },
  { key: "design", label: "Design", icon: "🏛️" },
  { key: "countryside", label: "Countryside", icon: "🌾" },
  { key: "luxe", label: "Luxe", icon: "👑" },
  { key: "tiny-homes", label: "Tiny homes", icon: "🏡" },
  { key: "city", label: "Iconic cities", icon: "🌆" },
] as const;

export const PROPERTY_TYPES = [
  "Entire home",
  "Entire villa",
  "Entire cabin",
  "Entire cottage",
  "Entire rental unit",
  "Entire loft",
  "Entire townhouse",
  "Entire bungalow",
  "Entire chalet",
  "Entire penthouse",
  "Entire farmhouse",
  "Tiny home",
  "Farm stay",
  "Dome",
  "Private room",
];
