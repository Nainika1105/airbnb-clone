"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { ListingInput } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import ListingForm from "@/components/ListingForm";

export default function NewListingPage() {
  const router = useRouter();
  const { user, loading, openAuthModal, refresh } = useAuth();

  useEffect(() => {
    if (!loading && !user) openAuthModal();
  }, [loading, user, openAuthModal]);

  const submit = async (data: ListingInput) => {
    try {
      const listing = await api<{ id: number }>("/api/listings", {
        method: "POST",
        body: data,
      });
      await refresh(); // user may have just become a host
      toast.success("Listing published!");
      router.push(`/rooms/${listing.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create listing");
    }
  };

  return (
    <main className="mx-auto max-w-screen-md px-6 py-10">
      <h1 className="text-3xl font-semibold">Airbnb your home</h1>
      <p className="mb-8 mt-1 text-gray-text">
        Tell us about your place — it takes just a few minutes to publish.
      </p>
      {user ? (
        <ListingForm submitLabel="Publish listing" onSubmit={submit} />
      ) : (
        <div className="rounded-xl border border-gray-border p-10 text-center">
          <p className="font-semibold">Log in to create a listing</p>
          <button
            onClick={openAuthModal}
            className="mt-4 rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Log in
          </button>
        </div>
      )}
    </main>
  );
}
