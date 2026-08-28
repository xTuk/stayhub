"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BookingCard from "@/components/BookingCard";
import { useAuth } from "@/components/AuthProvider";
import { formatUsd } from "@/lib/utils";
import type { HostBookingSummary, ListingSummary } from "@/types";

type HostedListing = ListingSummary & { _count: { bookings: number } };

export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<HostedListing[] | null>(null);
  const [bookings, setBookings] = useState<HostBookingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [listingsRes, bookingsRes] = await Promise.all([
        fetch("/api/listings/mine", { cache: "no-store" }),
        fetch("/api/bookings/hosted", { cache: "no-store" }),
      ]);

      if (!listingsRes.ok || !bookingsRes.ok) {
        setError("Could not load your listings.");
        return;
      }

      const listingsData = await listingsRes.json();
      const bookingsData = await bookingsRes.json();
      setListings(listingsData.listings);
      setBookings(bookingsData.bookings);
    }

    load().catch(() => setError("Could not load your listings."));
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My listings</h1>
          <p className="mt-1 text-sm text-ink-500">Properties you host, and their reservations.</p>
        </div>
        <Link href="/listings/new" className="btn-primary hidden sm:inline-flex">
          Host a new stay
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="mt-6">
        {listings === null && <p className="text-sm text-ink-500">Loading...</p>}

        {listings?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-ink-900">No listings yet</p>
            <p className="mt-1 text-sm text-ink-500">Create your first listing to start hosting.</p>
            <Link href="/listings/new" className="btn-primary mt-4 inline-flex">
              Host a new stay
            </Link>
          </div>
        )}

        {listings && listings.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}/edit`}
                className="flex gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink-100 hover:shadow-popover"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  {listing.photos[0] && (
                    <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{listing.title}</p>
                  <p className="text-sm text-ink-500">
                    {listing.city}, {listing.country}
                  </p>
                  <p className="mt-1 text-sm text-ink-600">
                    {formatUsd(listing.pricePerNight)} / night ·{" "}
                    {listing._count.bookings} booking{listing._count.bookings === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-900">Reservations</h2>
        <div className="mt-4 space-y-4">
          {bookings?.length === 0 && (
            <p className="text-sm text-ink-500">No reservations yet.</p>
          )}
          {bookings?.map((booking) => (
            <BookingCard
              key={booking.id}
              listing={booking.listing}
              checkIn={booking.checkIn}
              checkOut={booking.checkOut}
              nights={booking.nights}
              totalPrice={booking.totalPrice}
              status={booking.status}
              guestName={booking.guest.name}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
