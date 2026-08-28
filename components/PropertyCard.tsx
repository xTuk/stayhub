import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/utils";
import type { ListingSummary } from "@/types";

export default function PropertyCard({ listing }: { listing: ListingSummary }) {
  const cover = listing.photos[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100 transition-shadow hover:shadow-popover"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-10 w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 5.25h18M3 5.25c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125M3 5.25v13.5c0 .621.504 1.125 1.125 1.125h15.75c.621 0 1.125-.504 1.125-1.125V5.25"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-ink-900">
            {listing.title}
          </h3>
        </div>
        <p className="text-sm text-ink-500">
          {listing.city}, {listing.country}
        </p>
        <p className="text-sm">
          <span className="font-semibold text-ink-900">
            {formatUsd(listing.pricePerNight)}
          </span>{" "}
          <span className="text-ink-500">/ night</span>
        </p>
        {listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="badge">
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="badge">+{listing.amenities.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
