import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import ListingForm from "@/components/ListingForm";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { host: { select: { id: true, name: true, email: true } } },
  });

  if (!listing) {
    notFound();
  }

  if (listing.hostId !== user.id) {
    redirect(`/listings/${listing.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Edit listing</h1>
      <p className="mt-1 text-sm text-ink-500">
        Update the details, amenities, or photo gallery for this stay.
      </p>
      <div className="card mt-6 p-6 sm:p-8">
        <ListingForm
          mode="edit"
          listing={{
            id: listing.id,
            hostId: listing.hostId,
            title: listing.title,
            description: listing.description,
            city: listing.city,
            country: listing.country,
            pricePerNight: listing.pricePerNight,
            amenities: listing.amenities,
            photos: listing.photos,
            host: listing.host,
          }}
        />
      </div>
    </div>
  );
}
