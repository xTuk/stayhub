import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { errorResponse } from "@/lib/api-response";

/** GET /api/bookings/mine — bookings the current user made as a guest. */
export async function GET() {
  try {
    const user = await requireCurrentUser();
    const bookings = await prisma.booking.findMany({
      where: { guestId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, city: true, country: true, photos: true },
        },
      },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    return errorResponse(error);
  }
}
