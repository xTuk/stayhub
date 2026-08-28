"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AmenityInput from "@/components/AmenityInput";
import PhotoUploader from "@/components/PhotoUploader";
import type { ListingDetail } from "@/types";

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: ListingDetail;
}

export default function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [city, setCity] = useState(listing?.city ?? "");
  const [country, setCountry] = useState(listing?.country ?? "");
  const [pricePerNight, setPricePerNight] = useState(
    listing ? String(listing.pricePerNight) : ""
  );
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? []);
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? []);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const price = Number(pricePerNight);
    if (!Number.isInteger(price) || price <= 0) {
      setError("Enter a valid whole-dollar price per night.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, description, city, country, pricePerNight: price, amenities, photos };
      const url = mode === "create" ? "/api/listings" : `/api/listings/${listing?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save listing.");
      }

      router.push(`/listings/${data.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save listing.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!listing) return;
    if (!confirm("Delete this listing? This can't be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete listing.");
      }
      router.push("/my-listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete listing.");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          className="input"
          placeholder="Sunlit loft near the city center"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={5}
          className="input"
          placeholder="Describe the space, the neighborhood, and what makes it special."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="label">
            City
          </label>
          <input
            id="city"
            type="text"
            required
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="country" className="label">
            Country
          </label>
          <input
            id="country"
            type="text"
            required
            className="input"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-xs">
        <label htmlFor="price" className="label">
          Price per night (USD)
        </label>
        <input
          id="price"
          type="number"
          required
          min={1}
          step={1}
          className="input"
          value={pricePerNight}
          onChange={(e) => setPricePerNight(e.target.value)}
        />
      </div>

      <div>
        <span className="label">Amenities</span>
        <AmenityInput amenities={amenities} onChange={setAmenities} />
      </div>

      <div>
        <span className="label">Photos</span>
        {mode === "edit" && listing ? (
          <PhotoUploader listingId={listing.id} photos={photos} onChange={setPhotos} />
        ) : (
          <p className="rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-600">
            Save the listing first, then you&apos;ll be able to upload photos.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center justify-between border-t border-ink-100 pt-6">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Create listing"
              : "Save changes"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? "Deleting..." : "Delete listing"}
          </button>
        )}
      </div>
    </form>
  );
}
