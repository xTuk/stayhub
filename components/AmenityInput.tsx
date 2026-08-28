"use client";

import { useState, type KeyboardEvent } from "react";

export default function AmenityInput({
  amenities,
  onChange,
}: {
  amenities: string[];
  onChange: (amenities: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addAmenity() {
    const value = draft.trim();
    if (!value) return;
    if (amenities.some((a) => a.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...amenities, value]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addAmenity();
    }
  }

  function removeAmenity(value: string) {
    onChange(amenities.filter((a) => a !== value));
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          className="input"
          placeholder="e.g. Wifi, Pool, Kitchen"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={addAmenity} className="btn-secondary shrink-0">
          Add
        </button>
      </div>
      {amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 py-1 pl-3 pr-1.5 text-sm text-ink-700"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(amenity)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-ink-400 hover:bg-ink-200 hover:text-ink-700"
                aria-label={`Remove ${amenity}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
