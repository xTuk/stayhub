import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { errorResponse, ApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const appendPhotoSchema = z.object({ url: z.string().url() });

/**
 * POST /api/listings/:id/photos — called after a direct-to-S3 upload
 * succeeds, to persist the object's public URL on the listing. Host only.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new ApiError("Listing not found.", 404);
    }
    if (listing.hostId !== user.id) {
      throw new ApiError("You can only add photos to your own listings.", 403);
    }

    const { url } = appendPhotoSchema.parse(await request.json());

    const updated = await prisma.listing.update({
      where: { id },
      data: { photos: { push: url } },
    });

    return NextResponse.json({ listing: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/listings/:id/photos — remove one photo URL from a listing.
 * Host only.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new ApiError("Listing not found.", 404);
    }
    if (listing.hostId !== user.id) {
      throw new ApiError("You can only edit your own listings.", 403);
    }

    const { url } = appendPhotoSchema.parse(await request.json());

    const updated = await prisma.listing.update({
      where: { id },
      data: { photos: listing.photos.filter((p) => p !== url) },
    });

    return NextResponse.json({ listing: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
