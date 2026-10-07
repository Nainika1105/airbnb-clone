"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { addDays, differenceInDays, format } from "date-fns";
import toast from "react-hot-toast";
import { ListingDetail } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { StarIcon } from "./Icons";

const SERVICE_FEE_RATE = 0.14;

export default function BookingWidget({ listing }: { listing: ListingDetail }) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);

  const disabledRanges = useMemo(
    () =>
      listing.booked_ranges.map(([from, to]) => ({
        from: new Date(from + "T00:00:00"),
        to: addDays(new Date(to + "T00:00:00"), -1), // checkout day is available
      })),
    [listing.booked_ranges]
  );

  const nights =
    range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;

  const quote = useMemo(() => {
    if (nights < 1) return null;
    const subtotal = listing.price_per_night * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    return {
      subtotal,
      serviceFee,
      total: subtotal + listing.cleaning_fee + serviceFee,
    };
  }, [nights, listing]);

  // reject ranges spanning a booked period
  useEffect(() => {
    if (!range?.from || !range?.to) return;
    const overlaps = listing.booked_ranges.some(([f, t]) => {
      const bf = new Date(f + "T00:00:00");
      const bt = new Date(t + "T00:00:00");
      return range.from! < bt && range.to! > bf;
    });
    if (overlaps) {
      toast.error("Those dates include unavailable nights");
      setRange(undefined);
    }
  }, [range, listing.booked_ranges]);

  const reserve = () => {
    if (!range?.from || !range?.to || nights < 1) {
      setShowCalendar(true);
      return;
    }
    if (!user) {
      openAuthModal();
      return;
    }
    const q = new URLSearchParams({
      check_in: format(range.from, "yyyy-MM-dd"),
      check_out: format(range.to, "yyyy-MM-dd"),
      guests: String(guests),
    });
    router.push(`/book/${listing.id}?${q.toString()}`);
  };

  return (
    <div className="sticky top-28 rounded-xl border border-gray-border p-6 shadow-card">
      <div className="mb-4 flex items-end justify-between">
        <p>
          <span className="text-[22px] font-semibold">
            ${Math.round(listing.price_per_night)}
          </span>{" "}
          <span className="text-gray-text">night</span>
        </p>
        {listing.rating !== null && (
          <p className="flex items-center gap-1 text-sm">
            <StarIcon /> {listing.rating.toFixed(2)} ·{" "}
            <span className="text-gray-text underline">
              {listing.review_count} reviews
            </span>
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-400">
        <div className="grid grid-cols-2 divide-x divide-gray-400 border-b border-gray-400">
          <button
            className="px-3 py-2.5 text-left"
            onClick={() => {
              setShowCalendar((v) => !v);
              setShowGuests(false);
            }}
          >
            <span className="block text-[10px] font-bold uppercase">Check-in</span>
            <span className="text-sm">
              {range?.from ? format(range.from, "M/d/yyyy") : "Add date"}
            </span>
          </button>
          <button
            className="px-3 py-2.5 text-left"
            onClick={() => {
              setShowCalendar((v) => !v);
              setShowGuests(false);
            }}
          >
            <span className="block text-[10px] font-bold uppercase">Checkout</span>
            <span className="text-sm">
              {range?.to ? format(range.to, "M/d/yyyy") : "Add date"}
            </span>
          </button>
        </div>
        <button
          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
          onClick={() => {
            setShowGuests((v) => !v);
            setShowCalendar(false);
          }}
        >
          <span>
            <span className="block text-[10px] font-bold uppercase">Guests</span>
            <span className="text-sm">
              {guests} guest{guests > 1 ? "s" : ""}
            </span>
          </span>
          <span className="text-lg">{showGuests ? "▴" : "▾"}</span>
        </button>
      </div>

      {showCalendar && (
        <div className="mt-3 rounded-xl border border-gray-100 p-2 shadow-card">
          <DayPicker
            mode="range"
            numberOfMonths={1}
            selected={range}
            onSelect={setRange}
            disabled={[{ before: new Date() }, ...disabledRanges]}
          />
          <div className="flex justify-end gap-3 p-2 text-sm">
            <button className="underline" onClick={() => setRange(undefined)}>
              Clear dates
            </button>
            <button
              className="rounded-lg bg-gray-dark px-4 py-1.5 font-semibold text-white"
              onClick={() => setShowCalendar(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showGuests && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-100 p-4 shadow-card">
          <div>
            <p className="text-sm font-semibold">Guests</p>
            <p className="text-xs text-gray-text">Max {listing.max_guests}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              className="h-8 w-8 rounded-full border border-gray-400 text-gray-text disabled:opacity-30"
            >
              −
            </button>
            <span className="w-5 text-center text-sm">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(listing.max_guests, guests + 1))}
              disabled={guests >= listing.max_guests}
              className="h-8 w-8 rounded-full border border-gray-400 text-gray-text disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        onClick={reserve}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] py-3.5 font-semibold text-white transition hover:opacity-95"
      >
        {nights >= 1 ? "Reserve" : "Check availability"}
      </button>

      {quote && (
        <>
          <p className="mt-3 text-center text-sm text-gray-text">
            You won&apos;t be charged yet
          </p>
          <div className="mt-4 space-y-3 text-[15px]">
            <div className="flex justify-between">
              <span className="underline">
                ${Math.round(listing.price_per_night)} x {nights} nights
              </span>
              <span>${quote.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Cleaning fee</span>
              <span>${listing.cleaning_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Airbnb service fee</span>
              <span>${quote.serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-border pt-3 font-semibold">
              <span>Total before taxes</span>
              <span>${quote.total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
