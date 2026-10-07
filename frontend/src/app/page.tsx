"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ListingCard as ListingCardType, ListingPage } from "@/lib/types";
import ListingCard from "@/components/ListingCard";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-gray-200" />
      <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
    </div>
  );
}

function Explore() {
  const params = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<ListingCardType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const queryKey = params.toString();

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      setLoading(true);
      try {
        const q = new URLSearchParams(queryKey);
        q.set("page", String(pageNum));
        q.set("page_size", "12");
        const data = await api<ListingPage>(`/api/listings?${q.toString()}`);
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        setHasMore(data.has_more);
        setTotal(data.total);
        setPage(pageNum);
      } catch {
        // keep whatever we have
      } finally {
        setLoading(false);
      }
    },
    [queryKey]
  );

  // Reset on query change
  useEffect(() => {
    setItems([]);
    fetchPage(1, true);
  }, [fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPage(page + 1, false);
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPage]);

  const hasFilters = queryKey.length > 0;

  return (
    <main>
      <CategoryBar />
      <div className="mx-auto max-w-screen-2xl px-6 pt-6 lg:px-10">
        {total !== null && hasFilters && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-text">
              {total} {total === 1 ? "place" : "places"} found
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-sm font-semibold underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!loading && items.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="text-xl font-semibold">No exact matches</p>
            <p className="mt-1 text-gray-text">
              Try changing or removing some of your filters or adjusting your dates.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-lg border border-gray-dark px-5 py-2.5 font-semibold hover:bg-gray-50"
            >
              Remove all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
            {loading &&
              Array.from({ length: items.length === 0 ? 12 : 4 }).map((_, i) => (
                <SkeletonCard key={`s${i}`} />
              ))}
          </div>
        )}
        <div ref={sentinelRef} className="h-px" />

        {!hasMore && items.length > 0 && (
          <p className="pb-4 pt-12 text-center text-sm text-gray-text">
            You&apos;ve seen all {total} places
          </p>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <Explore />
    </Suspense>
  );
}
