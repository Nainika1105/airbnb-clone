"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/types";
import { FilterIcon } from "./Icons";
import FiltersModal from "./FiltersModal";

export default function CategoryBar() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("category") || "all";
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterCount = ["price_min", "price_max", "property_type", "bedrooms", "amenities"].filter(
    (k) => params.get(k)
  ).length;

  const selectCategory = (key: string) => {
    const q = new URLSearchParams(params.toString());
    if (key === "all") q.delete("category");
    else q.set("category", key);
    router.push(`/?${q.toString()}`);
  };

  return (
    <div className="sticky top-20 z-30 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-6 py-3 lg:px-10">
        <div className="no-scrollbar flex flex-1 items-center gap-8 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => selectCategory(c.key)}
              className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 pt-1 text-xs transition ${
                active === c.key
                  ? "border-gray-dark font-semibold text-gray-dark"
                  : "border-transparent text-gray-text hover:border-gray-300 hover:text-gray-dark"
              }`}
            >
              <span className="text-2xl leading-none">{c.icon}</span>
              <span className="whitespace-nowrap">{c.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-border px-4 py-3 text-xs font-medium hover:border-gray-dark"
        >
          <FilterIcon />
          Filters
          {filterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-dark text-[10px] text-white">
              {filterCount}
            </span>
          )}
        </button>
      </div>
      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  );
}
