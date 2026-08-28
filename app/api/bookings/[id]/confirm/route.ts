import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getStripeClient } from "@/lib/stripe";
import { errorResponse, ApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/bookings/:id/confirm
 *
 * Called by the client after Stripe Checkout redirects back to
 * /my-bookings?success=1&bookingId=... . Verifies the Checkout Session
 * actually completed payment before flipping the booking from PENDING to
 * CONFIRMED.
 *
 * Note: a production app would confirm bookings from a Stripe webhook
 * (checkout.session.completed) rather than trusting the client-side
 * redirect, since a user can close the tab before returning. This demo
 * keeps things simple and confirms on return; the booking simply stays
 * PENDING if that never happens, which is safe (no double-booking risk)
 * but is a known simplification worth calling out.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new ApiError("Booking not found.", 404);
    }
    if (booking.guestId !== user.id) {
      throw new ApiError("You don't have access to this booking.", 403);
    }
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ booking });
    }
    if (booking.status === "CANCELLED") {
      throw new ApiError("This booking was cancelled.", 400);
    }

    const stripe = getStripeClient();
    if (!stripe || !booking.stripeSessionId) {
      throw new ApiError("No payment session found for this booking.", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
    if (session.payment_status !== "paid") {
      throw new ApiError("Payment has not completed yet.", 402);
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
