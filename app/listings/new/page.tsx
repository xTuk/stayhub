"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ListingForm from "@/components/ListingForm";
import { useAuth } from "@/components/AuthProvider";

export default function NewListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-ink-500 sm:px-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Host a new stay</h1>
      <p className="mt-1 text-sm text-ink-500">
        Fill in the details below. You can add photos right after creating
        the listing.
      </p>
      <div className="card mt-6 p-6 sm:p-8">
        <ListingForm mode="create" />
      </div>
    </div>
  );
}
