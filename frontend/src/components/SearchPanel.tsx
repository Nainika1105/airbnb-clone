"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { SearchIcon } from "./Icons";

export default function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const [location, setLocation] = useState(params.get("location") || "");
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const ci = params.get("check_in");
    const co = params.get("check_out");
    if (ci && co) return { from: new Date(ci), to: new Date(co) };
    return undefined;
  });
  const [guests, setGuests] = useState(Number(params.get("guests")) || 0);
  const [section, setSection] = useState<"where" | "when" | "who">("where");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const search = () => {
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (range?.from) q.set("check_in", format(range.from, "yyyy-MM-dd"));
    if (range?.to) q.set("check_out", format(range.to, "yyyy-MM-dd"));
    if (guests > 0) q.set("guests", String(guests));
    const cat = params.get("category");
    if (cat) q.set("category", cat);
    onClose();
    router.push(`/?${q.toString()}`);
  };

  const POPULAR = ["Malibu", "Paris", "Tokyo", "Tulum", "New York", "Santorini", "Barcelona", "Italy"];

  return (
    <div ref={ref} className="animate-fade-up mx-auto w-full max-w-[850px] px-4 pb-4">
      {/* Segmented search bar */}
      <div className="flex items-stretch rounded-full border border-gray-border bg-white shadow-pill">
        <button
          onClick={() => setSection("where")}
          className={`flex-[1.5] rounded-full px-7 py-3 text-left hover:bg-gray-100 ${section === "where" ? "bg-white shadow-card" : ""}`}
        >
          <div className="text-xs font-semibold">Where</div>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </button>
        <div className="my-3 w-px bg-gray-border" />
        <button
          onClick={() => setSection("when")}
          className={`flex-1 rounded-full px-6 py-3 text-left hover:bg-gray-100 ${section === "when" ? "bg-white shadow-card" : ""}`}
        >
          <div className="text-xs font-semibold">Check in — Check out</div>
          <div className="text-sm text-gray-text">
            {range?.from
              ? `${format(range.from, "MMM d")}${range.to ? ` – ${format(range.to, "MMM d")}` : ""}`
              : "Add dates"}
          </div>
        </button>
        <div className="my-3 w-px bg-gray-border" />
        <div
          className={`flex flex-1 cursor-pointer items-center justify-between rounded-full py-2 pl-6 pr-2 hover:bg-gray-100 ${section === "who" ? "bg-white shadow-card" : ""}`}
          onClick={() => setSection("who")}
        >
          <div>
            <div className="text-xs font-semibold">Who</div>
            <div className="text-sm text-gray-text">
              {guests > 0 ? `${guests} guest${guests > 1 ? "s" : ""}` : "Add guests"}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              search();
            }}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark"
          >
            <SearchIcon className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Dropdown content */}
      <div className="mt-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-card">
        {section === "where" && (
          <div>
            <p className="mb-3 text-sm font-semibold">Popular destinations</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {POPULAR.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setLocation(p);
                    setSection("when");
                  }}
                  className="rounded-xl border border-gray-border px-4 py-3 text-left text-sm hover:border-gray-dark"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {section === "when" && (
          <div className="flex justify-center">
            <DayPicker
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
              disabled={{ before: new Date() }}
            />
          </div>
        )}
        {section === "who" && (
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold">Guests</p>
              <p className="text-sm text-gray-text">Ages 13 or above</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGuests(Math.max(0, guests - 1))}
                disabled={guests === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-lg text-gray-text hover:border-gray-dark disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center">{guests}</span>
              <button
                onClick={() => setGuests(guests + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-lg text-gray-text hover:border-gray-dark"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
