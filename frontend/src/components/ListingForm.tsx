"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Amenity, CATEGORIES, ListingInput, PROPERTY_TYPES } from "@/lib/types";
import toast from "react-hot-toast";

const EMPTY: ListingInput = {
  title: "",
  description: "",
  property_type: "Entire home",
  category: "beachfront",
  city: "",
  country: "",
  lat: 0,
  lng: 0,
  price_per_night: 100,
  cleaning_fee: 0,
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  image_urls: [],
  amenity_ids: [],
};

export default function ListingForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: ListingInput;
  submitLabel: string;
  onSubmit: (data: ListingInput) => Promise<void>;
}) {
  const [data, setData] = useState<ListingInput>(initial ?? EMPTY);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Amenity[]>("/api/listings/amenities").then(setAmenities).catch(() => {});
  }, []);

  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid image URL");
      return;
    }
    set("image_urls", [...data.image_urls, url]);
    setImageUrl("");
  };

  const toggleAmenity = (id: number) =>
    set(
      "amenity_ids",
      data.amenity_ids.includes(id)
        ? data.amenity_ids.filter((a) => a !== id)
        : [...data.amenity_ids, id]
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.image_urls.length === 0) {
      toast.error("Add at least one photo URL");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(data);
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-border px-4 py-3 outline-none focus:border-gray-dark";

  return (
    <form onSubmit={submit} className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold">The basics</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              className={inputCls}
              value={data.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Cozy cabin with a view"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              className={`${inputCls} h-36`}
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell guests what makes your place special…"
              required
              minLength={10}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Property type</label>
              <select
                className={inputCls}
                value={data.property_type}
                onChange={(e) => set("property_type", e.target.value)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                className={inputCls}
                value={data.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-border pt-8">
        <h2 className="mb-4 text-xl font-semibold">Location</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input
              className={inputCls}
              value={data.city}
              onChange={(e) => set("city", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country</label>
            <input
              className={inputCls}
              value={data.country}
              onChange={(e) => set("country", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Latitude (optional)</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              value={data.lat}
              onChange={(e) => set("lat", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Longitude (optional)</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              value={data.lng}
              onChange={(e) => set("lng", Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-gray-border pt-8">
        <h2 className="mb-4 text-xl font-semibold">Details & pricing</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(
            [
              ["price_per_night", "Price per night ($)", 1],
              ["cleaning_fee", "Cleaning fee ($)", 0],
              ["max_guests", "Max guests", 1],
              ["bedrooms", "Bedrooms", 0],
              ["beds", "Beds", 1],
              ["baths", "Baths", 0.5],
            ] as const
          ).map(([key, label, min]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium">{label}</label>
              <input
                type="number"
                min={min}
                step={key === "baths" ? 0.5 : 1}
                className={inputCls}
                value={data[key]}
                onChange={(e) => set(key, Number(e.target.value))}
                required
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-border pt-8">
        <h2 className="mb-1 text-xl font-semibold">Photos</h2>
        <p className="mb-4 text-sm text-gray-text">
          Paste image URLs (the first one becomes the cover photo).
        </p>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="https://images.unsplash.com/…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <button
            type="button"
            onClick={addImage}
            className="shrink-0 rounded-lg border border-gray-dark px-5 font-semibold hover:bg-gray-50"
          >
            Add
          </button>
        </div>
        {data.image_urls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.image_urls.map((url, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                <Image src={url} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-xs font-semibold shadow">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    set("image_urls", data.image_urls.filter((_, j) => j !== i))
                  }
                  className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow group-hover:flex"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-gray-border pt-8">
        <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 accent-gray-dark"
                checked={data.amenity_ids.includes(a.id)}
                onChange={() => toggleAmenity(a.id)}
              />
              {a.name}
            </label>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-border pt-6">
        <button
          disabled={busy}
          className="rounded-lg bg-gray-dark px-8 py-3.5 font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
