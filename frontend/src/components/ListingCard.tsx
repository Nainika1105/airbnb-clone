"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ListingCard as ListingCardType } from "@/lib/types";
import { ChevronLeft, ChevronRight, HeartIcon, StarIcon } from "./Icons";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ListingCard({ listing }: { listing: ListingCardType }) {
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState(listing.is_favorite);
  const { user, openAuthModal } = useAuth();
  const images = listing.images.length ? listing.images : ["/placeholder.jpg"];

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await api<{ is_favorite: boolean }>(
        `/api/wishlist/${listing.id}/toggle`,
        { method: "POST" }
      );
      setFav(res.is_favorite);
      toast.success(res.is_favorite ? "Saved to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Couldn't update wishlist");
    }
  };

  const step = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + dir + images.length) % images.length);
  };

  return (
    <Link href={`/rooms/${listing.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={images[idx]}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {listing.is_superhost && (
          <span className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold shadow">
            Superhost
          </span>
        )}
        <button
          onClick={toggleFav}
          className="absolute right-3 top-3 transition hover:scale-110"
          aria-label="Save to wishlist"
        >
          <HeartIcon filled={fav} className="h-6 w-6" />
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => step(e, -1)}
              className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition hover:scale-105 group-hover:flex group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => step(e, 1)}
              className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition hover:scale-105 group-hover:flex group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === idx % 5 ? "bg-white" : "bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 space-y-0.5 text-[15px]">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold leading-snug">
            {listing.city}, {listing.country}
          </span>
          {listing.rating !== null && (
            <span className="flex shrink-0 items-center gap-1">
              <StarIcon />
              {listing.rating.toFixed(2)}
            </span>
          )}
        </div>
        <p className="truncate text-gray-text">{listing.title}</p>
        <p className="text-gray-text">Hosted by {listing.host_name}</p>
        <p className="pt-0.5">
          <span className="font-semibold">${Math.round(listing.price_per_night)}</span>{" "}
          <span className="text-gray-text">night</span>
        </p>
      </div>
    </Link>
  );
}
