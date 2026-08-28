// Shared, serializable types used by both server and client components.
// Deliberately plain (no Prisma imports) so they're safe to use in client
// components and stay stable if the DB schema evolves.

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface ListingSummary {
  id: string;
  hostId: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  amenities: string[];
  photos: string[];
}

export interface ListingDetail extends ListingSummary {
  description: string;
  host: PublicUser;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface BookingSummary {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  listing: {
    id: string;
    title: string;
    city: string;
    country: string;
    photos: string[];
  };
}

export interface HostBookingSummary extends BookingSummary {
  guest: PublicUser;
}
