"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Booking, BookingQuote, ListingDetail } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, StarIcon } from "@/components/Icons";

function Checkout() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();

  const checkIn = params.get("check_in")!;
  const checkOut = params.get("check_out")!;
  const guests = Number(params.get("guests") || 1);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  useEffect(() => {
    if (!loading && !user) openAuthModal();
  }, [loading, user, openAuthModal]);

  useEffect(() => {
    api<ListingDetail>(`/api/listings/${id}`).then(setListing).catch(() => {});
    api<BookingQuote>(
      `/api/bookings/quote?listing_id=${id}&check_in=${checkIn}&check_out=${checkOut}`
    )
      .then(setQuote)
      .catch((e) => toast.error(e.message));
  }, [id, checkIn, checkOut]);

  const confirm = async () => {
    if (!user) return openAuthModal();
    setBusy(true);
    try {
      const booking = await api<Booking>("/api/bookings", {
        method: "POST",
        body: { listing_id: Number(id), check_in: checkIn, check_out: checkOut, guests },
      });
      setConfirmed(booking);
      toast.success("Reservation confirmed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  };

  if (!listing || !quote)
    return (
      <main className="mx-auto max-w-screen-lg animate-pulse px-6 py-10">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        <div className="mt-6 h-64 rounded-xl bg-gray-200" />
      </main>
    );

  if (confirmed) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="text-3xl font-semibold">You&apos;re going to {listing.city}!</h1>
        <p className="mt-3 text-gray-text">
          Your reservation at <strong>{listing.title}</strong> is confirmed —{" "}
          {format(new Date(checkIn), "MMM d")} to{" "}
          {format(new Date(checkOut), "MMM d, yyyy")} ·{" "}
          {guests} guest{guests > 1 ? "s" : ""}.
        </p>
        <p className="mt-1 text-sm text-gray-text">
          Confirmation #{String(confirmed.id).padStart(8, "0")} · Total $
          {confirmed.total_price.toFixed(2)}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/trips"
            className="rounded-lg bg-gray-dark px-6 py-3 font-semibold text-white hover:bg-black"
          >
            View my trips
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-dark px-6 py-3 font-semibold hover:bg-gray-50"
          >
            Keep exploring
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-screen-lg px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft />
        </button>
        <h1 className="text-[28px] font-semibold">Request to book</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: trip details + payment */}
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Your trip</h2>
            <div className="space-y-3 text-[15px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Dates</p>
                  <p className="text-gray-text">
                    {format(new Date(checkIn), "MMM d")} –{" "}
                    {format(new Date(checkOut), "MMM d, yyyy")}
                  </p>
                </div>
                <Link href={`/rooms/${id}`} className="font-semibold underline">
                  Edit
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Guests</p>
                  <p className="text-gray-text">
                    {guests} guest{guests > 1 ? "s" : ""}
                  </p>
                </div>
                <Link href={`/rooms/${id}`} className="font-semibold underline">
                  Edit
                </Link>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-border pt-8">
            <h2 className="mb-1 text-xl font-semibold">Pay with</h2>
            <p className="mb-4 text-sm text-gray-text">
              This is a demo checkout — no real payment is processed.
            </p>
            <div className="space-y-3">
              <label className="block rounded-lg border border-gray-border px-4 py-3">
                <span className="block text-xs text-gray-text">Card number</span>
                <input
                  className="w-full outline-none"
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                />
              </label>
              <div className="flex gap-3">
                <label className="block flex-1 rounded-lg border border-gray-border px-4 py-3">
                  <span className="block text-xs text-gray-text">Expiration</span>
                  <input className="w-full outline-none" defaultValue="12/29" />
                </label>
                <label className="block flex-1 rounded-lg border border-gray-border px-4 py-3">
                  <span className="block text-xs text-gray-text">CVV</span>
                  <input className="w-full outline-none" defaultValue="123" />
                </label>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-border pt-8">
            <h2 className="mb-2 text-xl font-semibold">Cancellation policy</h2>
            <p className="text-[15px] text-gray-text">
              Free cancellation before check-in. After that, the reservation is
              non-refundable.
            </p>
          </section>

          <button
            onClick={confirm}
            disabled={busy || !user}
            className="w-full rounded-lg bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] py-3.5 text-lg font-semibold text-white transition hover:opacity-95 disabled:opacity-60 lg:w-auto lg:px-10"
          >
            {busy ? "Confirming…" : "Confirm and pay"}
          </button>
        </div>

        {/* Right: summary card */}
        <div>
          <div className="sticky top-28 rounded-xl border border-gray-border p-6">
            <div className="flex gap-4 border-b border-gray-border pb-6">
              <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={listing.images[0]?.url || ""}
                  alt={listing.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{listing.title}</p>
                <p className="text-sm text-gray-text">
                  {listing.property_type} in {listing.city}
                </p>
                {listing.rating !== null && (
                  <p className="mt-1 flex items-center gap-1 text-xs">
                    <StarIcon className="h-3 w-3" />
                    {listing.rating.toFixed(2)} ({listing.review_count} reviews)
                  </p>
                )}
              </div>
            </div>

            <h3 className="py-4 text-xl font-semibold">Price details</h3>
            <div className="space-y-3 text-[15px]">
              <div className="flex justify-between">
                <span>
                  ${Math.round(quote.nightly_rate)} x {quote.nights} nights
                </span>
                <span>${quote.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning fee</span>
                <span>${quote.cleaning_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Airbnb service fee</span>
                <span>${quote.service_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-border pt-3 text-base font-semibold">
                <span>Total (USD)</span>
                <span>${quote.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
