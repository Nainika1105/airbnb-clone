"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ListingCard as ListingCardType } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";

export default function WishlistsPage() {
  const { user, loading, openAuthModal } = useAuth();
  const [items, setItems] = useState<ListingCardType[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      openAuthModal();
      setItems([]);
      return;
    }
    api<ListingCardType[]>("/api/wishlist").then(setItems).catch(() => setItems([]));
  }, [user, loading, openAuthModal]);

  return (
    <main className="mx-auto min-h-[60vh] max-w-screen-2xl px-6 py-10 lg:px-10">
      <h1 className="text-3xl font-semibold">Wishlists</h1>

      {items === null ? (
        <div className="mt-8 grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-gray-border p-10 text-center">
          <p className="text-xl font-semibold">Create your first wishlist</p>
          <p className="mt-1 text-gray-text">
            As you search, tap the heart icon to save your favorite places to stay.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Explore stays
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
      <Footer />
    </main>
  );
}
