import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { errorResponse } from "@/lib/api-response";

/**
 * GET /api/bookings/hosted — reservations made on any listing the current
 * user hosts, most recent first. Powers the "My listings" reservations view.
 */
export async function GET() {
  try {
    const user = await requireCurrentUser();
    const bookings = await prisma.booking.findMany({
      where: { listing: { hostId: user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, city: true, country: true, photos: true },
        },
        guest: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    return errorResponse(error);
  }
}
