"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { todayIsoDate } from "@/lib/utils";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    setCity("");
    setCheckIn("");
    setCheckOut("");
    router.push("/");
  }

  const hasFilters = Boolean(searchParams.get("city") || searchParams.get("checkIn"));

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-popover ring-1 ring-ink-100 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
    >
      <div>
        <label htmlFor="city" className="label">
          Where
        </label>
        <input
          id="city"
          type="text"
          placeholder="Search by city"
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="checkIn" className="label">
          Check-in
        </label>
        <input
          id="checkIn"
          type="date"
          className="input"
          min={todayIsoDate()}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="checkOut" className="label">
          Check-out
        </label>
        <input
          id="checkOut"
          type="date"
          className="input"
          min={checkIn || todayIsoDate()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary w-full sm:w-auto">
          Search
        </button>
        {hasFilters && (
          <button type="button" onClick={handleClear} className="btn-ghost">
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
