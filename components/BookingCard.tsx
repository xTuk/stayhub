import Image from "next/image";
import Link from "next/link";
import { formatDate, formatUsd } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-ink-100 text-ink-500",
};

interface BookingCardProps {
  listing: { id: string; title: string; city: string; country: string; photos: string[] };
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  guestName?: string;
  onCancel?: () => void;
  cancelling?: boolean;
}

export default function BookingCard({
  listing,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  status,
  guestName,
  onCancel,
  cancelling,
}: BookingCardProps) {
  const cover = listing.photos[0];
  const canCancel = onCancel && status !== "CANCELLED";

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100 sm:flex-row">
      <Link
        href={`/listings/${listing.id}`}
        className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-28 sm:w-40"
      >
        {cover && (
          <Image src={cover} alt={listing.title} fill className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link
              href={`/listings/${listing.id}`}
              className="font-semibold text-ink-900 hover:underline"
            >
              {listing.title}
            </Link>
            <span className={`badge ${STATUS_STYLES[status]}`}>{status}</span>
          </div>
          <p className="text-sm text-ink-500">
            {listing.city}, {listing.country}
          </p>
          {guestName && (
            <p className="mt-1 text-sm text-ink-600">Guest: {guestName}</p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="text-sm text-ink-600">
            <p>
              {formatDate(checkIn)} → {formatDate(checkOut)}{" "}
              <span className="text-ink-400">
                ({nights} night{nights === 1 ? "" : "s"})
              </span>
            </p>
            <p className="mt-0.5 font-semibold text-ink-900">{formatUsd(totalPrice)}</p>
          </div>
          {canCancel && (
            <button onClick={onCancel} disabled={cancelling} className="btn-danger">
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
