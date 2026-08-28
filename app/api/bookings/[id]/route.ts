import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { errorResponse, ApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({ action: z.literal("cancel") });

/** GET /api/bookings/:id — booking detail. Guest or host of the listing. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!booking) {
      throw new ApiError("Booking not found.", 404);
    }
    if (booking.guestId !== user.id && booking.listing.hostId !== user.id) {
      throw new ApiError("You don't have access to this booking.", 403);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return errorResponse(error);
  }
}

/** PATCH /api/bookings/:id — currently only supports {"action":"cancel"}. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new ApiError("Booking not found.", 404);
    }
    if (booking.guestId !== user.id) {
      throw new ApiError("You can only cancel your own bookings.", 403);
    }
    if (booking.status === "CANCELLED") {
      throw new ApiError("This booking is already cancelled.", 400);
    }

    patchSchema.parse(await request.json());

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
