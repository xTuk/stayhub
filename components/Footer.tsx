export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-sm font-bold text-white">
              S
            </span>
            <span className="font-bold text-ink-900">
              Stay<span className="text-brand-500">Hub</span>
            </span>
          </div>
          <p className="text-center text-sm text-ink-500">
            A portfolio project — property booking marketplace built with
            Next.js, Prisma, PostgreSQL, S3 and Stripe.
          </p>
        </div>
      </div>
    </footer>
  );
}
