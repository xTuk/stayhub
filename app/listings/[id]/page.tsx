import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import PhotoGallery from "@/components/PhotoGallery";
import BookingForm from "@/components/BookingForm";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, currentUser] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: { host: { select: { id: true, name: true, email: true } } },
    }),
    getCurrentUser(),
  ]);

  if (!listing) {
    notFound();
  }

  const isOwner = currentUser?.id === listing.hostId;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 text-ink-500">
            {listing.city}, {listing.country}
          </p>
        </div>
        {isOwner && (
          <Link href={`/listings/${listing.id}/edit`} className="btn-secondary shrink-0">
            Edit listing
          </Link>
        )}
      </div>

      <PhotoGallery photos={listing.photos} title={listing.title} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-lg font-semibold text-ink-900">About this place</h2>
            <p className="mt-2 whitespace-pre-line text-ink-600">{listing.description}</p>
          </section>

          {listing.amenities.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-ink-900">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span key={amenity} className="badge">
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-ink-900">Hosted by</h2>
            <p className="mt-2 text-ink-600">{listing.host.name}</p>
          </section>
        </div>

        <div>
          <BookingForm
            listingId={listing.id}
            hostId={listing.hostId}
            pricePerNight={listing.pricePerNight}
          />
        </div>
      </div>
    </div>
  );
}
