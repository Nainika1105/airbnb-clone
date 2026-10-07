"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Booking } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import ReviewModal from "@/components/ReviewModal";

export default function TripsPage() {
  const { user, loading, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [reviewFor, setReviewFor] = useState<Booking | null>(null);

  const load = useCallback(() => {
    api<Booking[]>("/api/bookings/mine").then(setBookings).catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      openAuthModal();
      setBookings([]);
      return;
    }
    load();
  }, [user, loading, openAuthModal, load]);

  const cancel = async (b: Booking) => {
    if (!window.confirm(`Cancel your trip to ${b.listing_city}? This can't be undone.`))
      return;
    try {
      await api(`/api/bookings/${b.id}/cancel`, { method: "POST" });
      toast.success("Trip cancelled");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't cancel");
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings || []).filter(
    (b) => b.check_out >= today && b.status === "confirmed"
  );
  const past = (bookings || []).filter(
    (b) => b.check_out < today || b.status !== "confirmed"
  );

  const TripCard = ({ b, isPast }: { b: Booking; isPast: boolean }) => (
    <div className="flex gap-4 rounded-xl border border-gray-border p-4">
      <Link
        href={`/rooms/${b.listing_id}`}
        className="relative h-32 w-40 shrink-0 overflow-hidden rounded-lg"
      >
        <Image
          src={b.listing_image}
          alt={b.listing_title}
          fill
          sizes="160px"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{b.listing_title}</p>
            <p className="text-sm text-gray-text">
              {b.listing_city}, {b.listing_country} · Hosted by {b.host_name}
            </p>
          </div>
          {b.status === "cancelled" && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-text">
              Cancelled
            </span>
          )}
        </div>
        <p className="mt-1 text-sm">
          {format(new Date(b.check_in), "MMM d, yyyy")} –{" "}
          {format(new Date(b.check_out), "MMM d, yyyy")} · {b.guests} guest
          {b.guests > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-sm text-gray-text">
          Total paid: <span className="font-semibold text-gray-dark">${b.total_price.toFixed(2)}</span>
        </p>
        <div className="mt-auto flex gap-3 pt-3 text-sm font-semibold">
          <Link href={`/rooms/${b.listing_id}`} className="underline">
            View listing
          </Link>
          {!isPast && b.status === "confirmed" && b.check_in > today && (
            <button onClick={() => cancel(b)} className="text-brand underline">
              Cancel trip
            </button>
          )}
          {isPast && b.status === "confirmed" && (
            <button onClick={() => setReviewFor(b)} className="underline">
              Leave a review
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="mx-auto min-h-[60vh] max-w-screen-lg px-6 py-10">
      <h1 className="text-3xl font-semibold">Trips</h1>

      {bookings === null ? (
        <div className="mt-8 animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-10 rounded-xl border border-gray-border p-10 text-center">
          <p className="text-xl font-semibold">No trips booked … yet!</p>
          <p className="mt-1 text-gray-text">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((b) => (
                  <TripCard key={b.id} b={b} isPast={false} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-semibold">Where you&apos;ve been</h2>
              <div className="space-y-4">
                {past.map((b) => (
                  <TripCard key={b.id} b={b} isPast={true} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ReviewModal
        booking={reviewFor}
        onClose={() => setReviewFor(null)}
        onDone={() => {
          setReviewFor(null);
          toast.success("Thanks for your review!");
        }}
      />
      <Footer />
    </main>
  );
}
