import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { listingUpdateSchema } from "@/lib/validation";
import { errorResponse, ApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/listings/:id — public listing detail, includes host info. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, email: true } },
      },
    });

    if (!listing) {
      throw new ApiError("Listing not found.", 404);
    }

    return NextResponse.json({ listing });
  } catch (error) {
    return errorResponse(error);
  }
}

/** PATCH /api/listings/:id — update a listing. Host only. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      throw new ApiError("Listing not found.", 404);
    }
    if (existing.hostId !== user.id) {
      throw new ApiError("You can only edit your own listings.", 403);
    }

    const body = await request.json();
    const data = listingUpdateSchema.parse(body);

    const listing = await prisma.listing.update({
      where: { id },
      data,
    });

    return NextResponse.json({ listing });
  } catch (error) {
    return errorResponse(error);
  }
}

/** DELETE /api/listings/:id — remove a listing. Host only. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const existing = await prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      throw new ApiError("Listing not found.", 404);
    }
    if (existing.hostId !== user.id) {
      throw new ApiError("You can only delete your own listings.", 403);
    }

    await prisma.listing.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
