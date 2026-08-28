import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { errorResponse } from "@/lib/api-response";

/** GET /api/listings/mine — listings the current user hosts. */
export async function GET() {
  try {
    const user = await requireCurrentUser();
    const listings = await prisma.listing.findMany({
      where: { hostId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
      },
    });
    return NextResponse.json({ listings });
  } catch (error) {
    return errorResponse(error);
  }
}
