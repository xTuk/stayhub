import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import {
  createPresignedUpload,
  isAllowedImageContentType,
  isS3Configured,
  S3_NOT_CONFIGURED_MESSAGE,
} from "@/lib/s3";
import { presignRequestSchema } from "@/lib/validation";
import { errorResponse, ApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/listings/:id/photos/presign
 * Returns a presigned S3 PUT URL for the browser to upload a photo
 * directly to, plus the public URL it will live at. Host only.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isS3Configured()) {
      throw new ApiError(S3_NOT_CONFIGURED_MESSAGE, 501);
    }

    const { id } = await params;
    const user = await requireCurrentUser();
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new ApiError("Listing not found.", 404);
    }
    if (listing.hostId !== user.id) {
      throw new ApiError("You can only add photos to your own listings.", 403);
    }

    const body = await request.json();
    const { filename, contentType } = presignRequestSchema.parse(body);

    if (!isAllowedImageContentType(contentType)) {
      throw new ApiError(
        "Only JPEG, PNG, WebP and AVIF images are supported.",
        400
      );
    }

    const presigned = await createPresignedUpload(listing.id, filename, contentType);

    return NextResponse.json(presigned);
  } catch (error) {
    return errorResponse(error);
  }
}
