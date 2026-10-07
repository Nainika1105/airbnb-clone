"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { api } from "@/lib/api";
import { Booking } from "@/lib/types";
import { StarIcon } from "./Icons";

export default function ReviewModal({
  booking,
  onClose,
  onDone,
}: {
  booking: Booking | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      await api("/api/reviews", {
        method: "POST",
        body: {
          listing_id: booking.listing_id,
          rating,
          cleanliness: rating,
          accuracy: rating,
          check_in_rating: rating,
          communication: rating,
          location_rating: rating,
          value: rating,
          comment,
        },
      });
      setComment("");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't submit review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!booking} onClose={onClose} title="Leave a review">
      {booking && (
        <div className="p-6">
          <p className="font-semibold">{booking.listing_title}</p>
          <p className="text-sm text-gray-text">
            {booking.listing_city}, {booking.listing_country}
          </p>

          <div className="mt-5 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <StarIcon
                  className={`h-8 w-8 transition ${n <= rating ? "text-brand" : "text-gray-200"}`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-text">{rating}/5</span>
          </div>

          <textarea
            className="mt-4 h-32 w-full rounded-lg border border-gray-border p-4 outline-none focus:border-gray-dark"
            placeholder="Share what you loved about your stay…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={submit}
            disabled={busy || comment.trim().length < 3}
            className="mt-4 w-full rounded-lg bg-gray-dark py-3 font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit review"}
          </button>
        </div>
      )}
    </Modal>
  );
}
