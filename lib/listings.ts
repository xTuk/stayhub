import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface ListingSearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
}

/**
 * Shared search/filter logic used by both the public search page (server
 * component) and the /api/listings route (used by client-side re-search).
 * Listings with any PENDING or CONFIRMED booking overlapping the requested
 * date range are excluded.
 */
export async function searchListings({ city, checkIn, checkOut }: ListingSearchParams) {
  const where: Prisma.ListingWhereInput = {};

  if (city && city.trim()) {
    where.city = { contains: city.trim(), mode: "insensitive" };
  }

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      !Number.isNaN(checkInDate.getTime()) &&
      !Number.isNaN(checkOutDate.getTime()) &&
      checkInDate < checkOutDate
    ) {
      where.bookings = {
        none: {
          status: { in: ["PENDING", "CONFIRMED"] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      };
    }
  }

  return prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}
