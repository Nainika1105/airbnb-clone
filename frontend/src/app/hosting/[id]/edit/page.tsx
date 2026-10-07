"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { ListingDetail, ListingInput } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import ListingForm from "@/components/ListingForm";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading, openAuthModal } = useAuth();
  const [initial, setInitial] = useState<ListingInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) openAuthModal();
  }, [loading, user, openAuthModal]);

  useEffect(() => {
    api<ListingDetail>(`/api/listings/${id}`)
      .then((l) =>
        setInitial({
          title: l.title,
          description: l.description,
          property_type: l.property_type,
          category: l.category,
          city: l.city,
          country: l.country,
          lat: l.lat,
          lng: l.lng,
          price_per_night: l.price_per_night,
          cleaning_fee: l.cleaning_fee,
          max_guests: l.max_guests,
          bedrooms: l.bedrooms,
          beds: l.beds,
          baths: l.baths,
          image_urls: l.images.map((i) => i.url),
          amenity_ids: l.amenities.map((a) => a.id),
        })
      )
      .catch((e) => setError(e.message));
  }, [id]);

  const submit = async (data: ListingInput) => {
    try {
      await api(`/api/listings/${id}`, { method: "PUT", body: data });
      toast.success("Listing updated");
      router.push("/hosting");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update listing");
    }
  };

  return (
    <main className="mx-auto max-w-screen-md px-6 py-10">
      <h1 className="mb-8 text-3xl font-semibold">Edit listing</h1>
      {error ? (
        <p className="text-gray-text">{error}</p>
      ) : !initial ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 rounded-lg bg-gray-200" />
          <div className="h-36 rounded-lg bg-gray-200" />
        </div>
      ) : (
        <ListingForm initial={initial} submitLabel="Save changes" onSubmit={submit} />
      )}
    </main>
  );
}
