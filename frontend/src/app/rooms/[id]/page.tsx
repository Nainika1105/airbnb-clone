"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { ListingDetail } from "@/lib/types";
import PhotoGallery from "@/components/PhotoGallery";
import BookingWidget from "@/components/BookingWidget";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import { HeartIcon, MedalIcon, ShareIcon, StarIcon } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";

const AMENITY_EMOJI: Record<string, string> = {
  wifi: "📶", kitchen: "🍳", parking: "🚗", pool: "🏊", hottub: "🛁",
  ac: "❄️", heating: "🔥", washer: "🫧", dryer: "🌀", tv: "📺",
  workspace: "💻", pets: "🐾", gym: "🏋️", bbq: "🍖", firepit: "🔥",
  beach: "🏖️", mountain: "⛰️", smoke: "🚨", firstaid: "🩹", selfcheckin: "🔑",
};

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const { user, openAuthModal } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    api<ListingDetail>(`/api/listings/${id}`)
      .then((l) => {
        setListing(l);
        setFav(l.is_favorite);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const toggleFav = async () => {
    if (!user) return openAuthModal();
    try {
      const res = await api<{ is_favorite: boolean }>(
        `/api/wishlist/${id}/toggle`,
        { method: "POST" }
      );
      setFav(res.is_favorite);
      toast.success(res.is_favorite ? "Saved to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Couldn't update wishlist");
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  if (error)
    return (
      <main className="mx-auto max-w-screen-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">This listing isn&apos;t available</h1>
        <p className="mt-2 text-gray-text">{error}</p>
      </main>
    );

  if (!listing)
    return (
      <main className="mx-auto max-w-screen-lg animate-pulse px-6 py-10">
        <div className="h-8 w-2/3 rounded bg-gray-200" />
        <div className="mt-6 aspect-[2/1] rounded-xl bg-gray-200" />
      </main>
    );

  const hostYears = Math.max(
    1,
    new Date().getFullYear() - new Date(listing.host.created_at).getFullYear()
  );

  return (
    <main className="mx-auto max-w-screen-lg px-6 pt-6">
      {/* Title row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px] font-semibold">{listing.title}</h1>
        <div className="flex items-center gap-1 text-sm font-medium">
          <button onClick={share} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100">
            <ShareIcon /> <span className="underline">Share</span>
          </button>
          <button onClick={toggleFav} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100">
            <HeartIcon filled={fav} className="h-5 w-5" />
            <span className="underline">{fav ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      <PhotoGallery images={listing.images} title={listing.title} />

      <div className="grid grid-cols-1 gap-x-16 lg:grid-cols-[1fr,380px]">
        {/* Left column */}
        <div>
          <section className="border-b border-gray-border py-6">
            <h2 className="text-[22px] font-semibold">
              {listing.property_type} in {listing.city}, {listing.country}
            </h2>
            <p className="text-gray-dark">
              {listing.max_guests} guests · {listing.bedrooms} bedroom
              {listing.bedrooms !== 1 && "s"} · {listing.beds} bed
              {listing.beds !== 1 && "s"} · {listing.baths} bath
              {listing.baths !== 1 && "s"}
            </p>
            {listing.rating !== null && (
              <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                <StarIcon /> {listing.rating.toFixed(2)} ·{" "}
                <a href="#reviews" className="underline">
                  {listing.review_count} reviews
                </a>
              </p>
            )}
          </section>

          {/* Host */}
          <section className="flex items-center gap-4 border-b border-gray-border py-6">
            <Image
              src={listing.host.avatar_url}
              alt={listing.host.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">Hosted by {listing.host.name}</p>
              <p className="text-sm text-gray-text">
                {listing.host.is_superhost && "Superhost · "}
                {hostYears} year{hostYears > 1 && "s"} hosting ·{" "}
                {listing.host_listing_count} listing
                {listing.host_listing_count !== 1 && "s"} ·{" "}
                {listing.host_review_count} review
                {listing.host_review_count !== 1 && "s"}
              </p>
            </div>
          </section>

          {listing.host.is_superhost && (
            <section className="flex items-start gap-4 border-b border-gray-border py-6">
              <MedalIcon className="mt-0.5 h-6 w-6 text-brand" />
              <div>
                <p className="font-semibold">{listing.host.name} is a Superhost</p>
                <p className="text-sm text-gray-text">
                  Superhosts are experienced, highly rated hosts committed to great
                  stays for guests.
                </p>
              </div>
            </section>
          )}

          {/* Description */}
          <section className="border-b border-gray-border py-8">
            <p className="whitespace-pre-line leading-relaxed text-gray-dark">
              {listing.description}
            </p>
          </section>

          {/* Amenities */}
          <section className="border-b border-gray-border py-8">
            <h2 className="mb-5 text-[22px] font-semibold">What this place offers</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              {listing.amenities.map((a) => (
                <div key={a.id} className="flex items-center gap-4">
                  <span className="text-xl">{AMENITY_EMOJI[a.icon] ?? "✔️"}</span>
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Map */}
          <section className="py-8">
            <h2 className="mb-1 text-[22px] font-semibold">Where you&apos;ll be</h2>
            <p className="mb-4 text-gray-text">
              {listing.city}, {listing.country}
            </p>
            <iframe
              title="map"
              className="h-[380px] w-full rounded-xl border border-gray-100"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.08}%2C${listing.lat - 0.05}%2C${listing.lng + 0.08}%2C${listing.lat + 0.05}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
            />
          </section>
        </div>

        {/* Right column: booking widget */}
        <div className="py-6">
          <BookingWidget listing={listing} />
        </div>
      </div>

      <ReviewsSection listing={listing} />
      <Footer />
    </main>
  );
}
