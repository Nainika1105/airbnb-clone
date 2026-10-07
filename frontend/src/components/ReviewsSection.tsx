"use client";

import Image from "next/image";
import { format } from "date-fns";
import { ListingDetail } from "@/lib/types";
import { StarIcon } from "./Icons";

const LABELS: Record<string, string> = {
  cleanliness: "Cleanliness",
  accuracy: "Accuracy",
  check_in: "Check-in",
  communication: "Communication",
  location: "Location",
  value: "Value",
};

export default function ReviewsSection({ listing }: { listing: ListingDetail }) {
  if (listing.review_count === 0) {
    return (
      <section className="border-t border-gray-border py-8">
        <h2 className="text-xl font-semibold">No reviews (yet)</h2>
        <p className="mt-1 text-gray-text">
          This place is new to Airbnb — be the first to stay here.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-gray-border py-10" id="reviews">
      <h2 className="flex items-center gap-2 text-[22px] font-semibold">
        <StarIcon className="h-5 w-5" />
        {listing.rating?.toFixed(2)} · {listing.review_count} reviews
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-x-16 gap-y-2 sm:grid-cols-2">
        {Object.entries(listing.rating_breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between py-1.5">
            <span className="text-[15px]">{LABELS[key] ?? key}</span>
            <div className="flex items-center gap-3">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gray-dark"
                  style={{ width: `${(val / 5) * 100}%` }}
                />
              </div>
              <span className="w-7 text-right text-xs font-semibold">
                {val.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-2">
        {listing.reviews.slice(0, 8).map((r) => (
          <div key={r.id}>
            <div className="flex items-center gap-3">
              <Image
                src={r.author_avatar}
                alt={r.author_name}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{r.author_name}</p>
                <p className="text-sm text-gray-text">
                  {format(new Date(r.created_at), "MMMM yyyy")}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-2.5 w-2.5 ${i < Math.round(r.rating) ? "" : "opacity-20"}`}
                />
              ))}
            </div>
            <p className="mt-2 leading-relaxed text-gray-dark">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
