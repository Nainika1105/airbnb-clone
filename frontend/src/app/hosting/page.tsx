"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Booking, ListingCard as ListingCardType } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { StarIcon } from "@/components/Icons";
import Footer from "@/components/Footer";

export default function HostingDashboard() {
  const { user, loading, openAuthModal } = useAuth();
  const [listings, setListings] = useState<ListingCardType[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [tab, setTab] = useState<"listings" | "bookings">("listings");

  const load = useCallback(() => {
    api<ListingCardType[]>("/api/host/listings").then(setListings).catch(() => setListings([]));
    api<Booking[]>("/api/host/bookings").then(setBookings).catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      openAuthModal();
      setListings([]);
      setBookings([]);
      return;
    }
    load();
  }, [user, loading, openAuthModal, load]);

  const remove = async (l: ListingCardType) => {
    if (!window.confirm(`Delete "${l.title}"? This removes the listing and its bookings.`))
      return;
    try {
      await api(`/api/listings/${l.id}`, { method: "DELETE" });
      toast.success("Listing deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete listing");
    }
  };

  const upcomingRevenue = (bookings || [])
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <main className="mx-auto min-h-[60vh] max-w-screen-lg px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-gray-text">Manage your listings and reservations</p>
        </div>
        <Link
          href="/hosting/new"
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          + Create new listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-border p-5">
          <p className="text-sm text-gray-text">Active listings</p>
          <p className="text-3xl font-semibold">{listings?.length ?? "–"}</p>
        </div>
        <div className="rounded-xl border border-gray-border p-5">
          <p className="text-sm text-gray-text">Total reservations</p>
          <p className="text-3xl font-semibold">
            {bookings?.filter((b) => b.status === "confirmed").length ?? "–"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-border p-5">
          <p className="text-sm text-gray-text">Gross earnings</p>
          <p className="text-3xl font-semibold">${upcomingRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex gap-6 border-b border-gray-border text-[15px] font-medium">
        {(["listings", "bookings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 pb-3 capitalize ${
              tab === t ? "border-gray-dark" : "border-transparent text-gray-text"
            }`}
          >
            {t === "listings" ? "Your listings" : "Reservations"}
          </button>
        ))}
      </div>

      {tab === "listings" && (
        <div className="mt-6">
          {listings === null ? (
            <p className="text-gray-text">Loading…</p>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-gray-border p-10 text-center">
              <p className="text-xl font-semibold">You have no listings yet</p>
              <p className="mt-1 text-gray-text">
                Create your first listing and start earning.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((l) => (
                <div key={l.id} className="flex gap-4 rounded-xl border border-gray-border p-4">
                  <Link
                    href={`/rooms/${l.id}`}
                    className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={l.images[0] || ""}
                      alt={l.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate font-semibold">{l.title}</p>
                    <p className="text-sm text-gray-text">
                      {l.city}, {l.country} · ${Math.round(l.price_per_night)}/night
                    </p>
                    {l.rating !== null && (
                      <p className="mt-1 flex items-center gap-1 text-sm">
                        <StarIcon /> {l.rating.toFixed(2)} ({l.review_count} reviews)
                      </p>
                    )}
                    <div className="mt-auto flex gap-4 pt-2 text-sm font-semibold">
                      <Link href={`/hosting/${l.id}/edit`} className="underline">
                        Edit
                      </Link>
                      <Link href={`/rooms/${l.id}`} className="underline">
                        Preview
                      </Link>
                      <button onClick={() => remove(l)} className="text-brand underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="mt-6 overflow-x-auto">
          {bookings === null ? (
            <p className="text-gray-text">Loading…</p>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-gray-border p-10 text-center">
              <p className="text-xl font-semibold">No reservations yet</p>
              <p className="mt-1 text-gray-text">
                When guests book your places, they&apos;ll show up here.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-border text-gray-text">
                  <th className="py-3 pr-4 font-medium">Guest</th>
                  <th className="py-3 pr-4 font-medium">Listing</th>
                  <th className="py-3 pr-4 font-medium">Dates</th>
                  <th className="py-3 pr-4 font-medium">Guests</th>
                  <th className="py-3 pr-4 font-medium">Payout</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium">{b.guest_name}</td>
                    <td className="max-w-[200px] truncate py-3 pr-4">{b.listing_title}</td>
                    <td className="py-3 pr-4">
                      {format(new Date(b.check_in), "MMM d")} –{" "}
                      {format(new Date(b.check_out), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 pr-4">{b.guests}</td>
                    <td className="py-3 pr-4">${b.total_price.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-text"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <Footer />
    </main>
  );
}
