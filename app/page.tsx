import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { searchListings } from "@/lib/listings";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; checkIn?: string; checkOut?: string }>;
}) {
  const { city, checkIn, checkOut } = await searchParams;
  const listings = await searchListings({ city, checkIn, checkOut });

  const hasFilters = Boolean(city || checkIn);

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Find a place that feels like home.
          </h1>
          <p className="mt-3 max-w-xl text-ink-600">
            Search stays by city, pick your dates, and book instantly. List
            your own place in minutes.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-[92px] rounded-2xl bg-white/60" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-ink-900">
            {hasFilters ? "Available stays" : "Popular stays"}
          </h2>
          <p className="text-sm text-ink-500">
            {listings.length} {listings.length === 1 ? "result" : "results"}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-ink-900">No stays found</p>
            <p className="mt-1 text-sm text-ink-500">
              Try a different city or a wider date range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
