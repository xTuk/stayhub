"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatUsd, nightsBetween, todayIsoDate } from "@/lib/utils";
import { getStripeClientJs } from "@/lib/stripe-client";

interface BookingFormProps {
  listingId: string;
  hostId: string;
  pricePerNight: number;
}

export default function BookingForm({ listingId, hostId, pricePerNight }: BookingFormProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) return 0;
    return nightsBetween(inDate, outDate);
  }, [checkIn, checkOut]);

  const total = nights * pricePerNight;
  const isOwnListing = Boolean(user && user.id === hostId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!user) {
      router.push("/login");
      return;
    }
    if (nights <= 0) {
      setError("Choose a valid check-in and check-out date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, checkIn, checkOut }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create booking.");
      }

      if (data.simulated) {
        setNotice(
          "Stripe isn't configured in this environment, so your booking was confirmed instantly in demo mode."
        );
        setTimeout(() => router.push("/my-bookings"), 1200);
        return;
      }

      if (data.checkoutUrl) {
        const stripe = await getStripeClientJs();
        if (stripe && data.booking?.stripeSessionId) {
          const { error: redirectError } = await stripe.redirectToCheckout({
            sessionId: data.booking.stripeSessionId,
          });
          if (redirectError) {
            // Fall back to a plain redirect if Stripe.js itself failed.
            window.location.href = data.checkoutUrl;
          }
        } else {
          window.location.href = data.checkoutUrl;
        }
        return;
      }

      throw new Error("Could not start checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card sticky top-24 p-6">
      <p className="text-lg">
        <span className="font-bold text-ink-900">{formatUsd(pricePerNight)}</span>{" "}
        <span className="text-ink-500">/ night</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="bookCheckIn" className="label">
              Check-in
            </label>
            <input
              id="bookCheckIn"
              type="date"
              required
              min={todayIsoDate()}
              className="input"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bookCheckOut" className="label">
              Check-out
            </label>
            <input
              id="bookCheckOut"
              type="date"
              required
              min={checkIn || todayIsoDate()}
              className="input"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        {nights > 0 && (
          <div className="space-y-1 border-t border-ink-100 pt-3 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>
                {formatUsd(pricePerNight)} × {nights} night{nights === 1 ? "" : "s"}
              </span>
              <span>{formatUsd(total)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-1.5 font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatUsd(total)}</span>
            </div>
          </div>
        )}

        {isOwnListing && (
          <p className="rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-600">
            This is your own listing — you can&apos;t book it.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {notice && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loading || isOwnListing}
          className="btn-primary w-full"
        >
          {submitting ? "Processing..." : user ? "Reserve" : "Log in to book"}
        </button>
        <p className="text-center text-xs text-ink-400">
          You won&apos;t be charged yet in this demo — checkout runs in Stripe test mode.
        </p>
      </form>
    </div>
  );
}
