"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "./Modal";
import { api } from "@/lib/api";
import { Amenity, PROPERTY_TYPES } from "@/lib/types";

export default function FiltersModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [priceMin, setPriceMin] = useState(params.get("price_min") || "");
  const [priceMax, setPriceMax] = useState(params.get("price_max") || "");
  const [propertyType, setPropertyType] = useState(params.get("property_type") || "");
  const [bedrooms, setBedrooms] = useState(Number(params.get("bedrooms")) || 0);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set((params.get("amenities") || "").split(",").filter(Boolean).map(Number))
  );

  useEffect(() => {
    if (open && amenities.length === 0) {
      api<Amenity[]>("/api/listings/amenities").then(setAmenities).catch(() => {});
    }
  }, [open, amenities.length]);

  const toggleAmenity = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const apply = () => {
    const q = new URLSearchParams(params.toString());
    const setOrDel = (key: string, val: string) => (val ? q.set(key, val) : q.delete(key));
    setOrDel("price_min", priceMin);
    setOrDel("price_max", priceMax);
    setOrDel("property_type", propertyType);
    setOrDel("bedrooms", bedrooms ? String(bedrooms) : "");
    setOrDel("amenities", Array.from(selected).join(","));
    onClose();
    router.push(`/?${q.toString()}`);
  };

  const clear = () => {
    setPriceMin("");
    setPriceMax("");
    setPropertyType("");
    setBedrooms(0);
    setSelected(new Set());
  };

  return (
    <Modal open={open} onClose={onClose} title="Filters">
      <div className="space-y-7 p-6">
        <section>
          <h3 className="mb-1 text-lg font-semibold">Price range</h3>
          <p className="mb-4 text-sm text-gray-text">Nightly prices before fees and taxes</p>
          <div className="flex items-center gap-4">
            <label className="flex-1 rounded-lg border border-gray-border px-4 py-2">
              <span className="block text-xs text-gray-text">Minimum</span>
              <div className="flex items-center">
                <span className="mr-1">$</span>
                <input
                  type="number"
                  min={0}
                  className="w-full outline-none"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
              </div>
            </label>
            <span className="text-gray-text">—</span>
            <label className="flex-1 rounded-lg border border-gray-border px-4 py-2">
              <span className="block text-xs text-gray-text">Maximum</span>
              <div className="flex items-center">
                <span className="mr-1">$</span>
                <input
                  type="number"
                  min={0}
                  className="w-full outline-none"
                  placeholder="1300+"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </label>
          </div>
        </section>

        <section className="border-t border-gray-100 pt-6">
          <h3 className="mb-4 text-lg font-semibold">Bedrooms</h3>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setBedrooms(n)}
                className={`rounded-full border px-5 py-2 text-sm ${
                  bedrooms === n
                    ? "border-gray-dark bg-gray-dark text-white"
                    : "border-gray-border hover:border-gray-dark"
                }`}
              >
                {n === 0 ? "Any" : `${n}+`}
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 pt-6">
          <h3 className="mb-4 text-lg font-semibold">Property type</h3>
          <div className="flex flex-wrap gap-2">
            {["", ...PROPERTY_TYPES.slice(0, 9)].map((t) => (
              <button
                key={t || "any"}
                onClick={() => setPropertyType(t)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  propertyType === t
                    ? "border-gray-dark bg-gray-dark text-white"
                    : "border-gray-border hover:border-gray-dark"
                }`}
              >
                {t || "Any type"}
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 pt-6">
          <h3 className="mb-4 text-lg font-semibold">Amenities</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenities.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-gray-dark"
                  checked={selected.has(a.id)}
                  onChange={() => toggleAmenity(a.id)}
                />
                {a.name}
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-border bg-white px-6 py-4">
        <button onClick={clear} className="text-sm font-semibold underline">
          Clear all
        </button>
        <button
          onClick={apply}
          className="rounded-lg bg-gray-dark px-6 py-3 font-semibold text-white hover:bg-black"
        >
          Show places
        </button>
      </div>
    </Modal>
  );
}
