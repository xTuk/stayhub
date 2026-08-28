"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import BookingCard from "@/components/BookingCard";
import { useAuth } from "@/components/AuthProvider";
import type { BookingSummary } from "@/types";

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-ink-500 sm:px-6 lg:px-8">
          Loading...
        </div>
      }
    >
      <MyBookingsContent />
    </Suspense>
  );
}

function MyBookingsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState<BookingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/bookings/mine", { cache: "no-store" });
    if (!res.ok) {
      setError("Could not load your bookings.");
      return;
    }
    const data = await res.json();
    setBookings(data.bookings);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const bookingId = searchParams.get("bookingId");
    const success = searchParams.get("success");

    async function run() {
      if (success === "1" && bookingId) {
        setConfirming(true);
        await fetch(`/api/bookings/${bookingId}/confirm`, { method: "POST" }).catch(
          () => undefined
        );
        setConfirming(false);
        router.replace("/my-bookings");
      }
      await loadBookings();
    }
    run();
  }, [user, searchParams, loadBookings, router]);

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not cancel booking.");
      }
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">My bookings</h1>
      <p className="mt-1 text-sm text-ink-500">Stays you&apos;ve reserved as a guest.</p>

      {confirming && (
        <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Confirming your payment...
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 space-y-4">
        {bookings === null && <p className="text-sm text-ink-500">Loading...</p>}

        {bookings?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-ink-900">No bookings yet</p>
            <p className="mt-1 text-sm text-ink-500">
              When you reserve a stay, it will show up here.
            </p>
            <Link href="/" className="btn-primary mt-4 inline-flex">
              Explore stays
            </Link>
          </div>
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
            onCancel={() => handleCancel(booking.id)}
            cancelling={cancellingId === booking.id}
          />
        ))}
      </div>
    </div>
  );
}
