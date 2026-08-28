import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-brand-500">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to StayHub
      </Link>
    </div>
  );
}
