import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { listingSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/api-response";
import { searchListings } from "@/lib/listings";

/**
 * GET /api/listings?city=&checkIn=&checkOut=
 *
 * Public search/browse endpoint (used for client-side re-search after the
 * initial server-rendered page load). Excludes listings with any
 * overlapping non-cancelled booking when a date range is given.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listings = await searchListings({
      city: searchParams.get("city") ?? undefined,
      checkIn: searchParams.get("checkIn") ?? undefined,
      checkOut: searchParams.get("checkOut") ?? undefined,
    });
    return NextResponse.json({ listings });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/listings — create a new listing. Any authenticated user may
 * create a listing (host role is implicit, not a separate account type).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const data = listingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: { ...data, hostId: user.id },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
