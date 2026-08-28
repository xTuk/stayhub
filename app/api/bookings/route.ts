import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { bookingRequestSchema } from "@/lib/validation";
import { errorResponse, ApiError } from "@/lib/api-response";
import { nightsBetween } from "@/lib/utils";

/**
 * POST /api/bookings — start a booking for a listing.
 *
 * Any authenticated user may book (guest role is implicit). Availability is
 * re-checked server-side even though the search page already filters by
 * date, to avoid a race between two guests booking the same dates.
 *
 * When Stripe is configured, this creates a PENDING booking plus a Stripe
 * Checkout Session and returns its URL for the client to redirect to. When
 * Stripe is not configured, the booking is auto-confirmed so the flow still
 * works end-to-end in a sandbox/demo environment.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const { listingId, checkIn: checkInStr, checkOut: checkOutStr } =
      bookingRequestSchema.parse(body);

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new ApiError("Check-in date can't be in the past.", 400);
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new ApiError("Listing not found.", 404);
    }
    if (listing.hostId === user.id) {
      throw new ApiError("You can't book your own listing.", 400);
    }

    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
    if (overlapping) {
      throw new ApiError(
        "This listing is not available for the selected dates.",
        409
      );
    }

    const nights = nightsBetween(checkIn, checkOut);
    const totalPrice = nights * listing.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        listingId,
        guestId: user.id,
        checkIn,
        checkOut,
        nights,
        totalPrice,
        status: isStripeConfigured() ? "PENDING" : "CONFIRMED",
      },
    });

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ booking, checkoutUrl: null, simulated: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: totalPrice * 100,
            product_data: {
              name: `${listing.title} — ${nights} night${nights === 1 ? "" : "s"}`,
              description: `${listing.city}, ${listing.country}`,
            },
          },
        },
      ],
      success_url: `${appUrl}/my-bookings?success=1&bookingId=${booking.id}`,
      cancel_url: `${appUrl}/listings/${listingId}?checkout=cancelled`,
      metadata: { bookingId: booking.id },
    });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      booking: updated,
      checkoutUrl: session.url,
      simulated: false,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
