# StayHub

StayHub is a full-stack property booking marketplace — think a lean Airbnb clone — built to demonstrate production-style patterns for a marketplace/booking product: search with availability filtering, direct-to-S3 photo uploads, and a real Stripe checkout flow, all on a typed Next.js + Prisma stack. It's a portfolio project showing how I structure a real-world app end to end, from schema to deploy.

## Features

- **Auth** — email/password signup and login with bcrypt-hashed passwords and JWTs in an httpOnly cookie. No third-party auth provider.
- **Listings** — create, edit, and delete property listings (title, description, city/country, price per night, amenities, photo gallery). Any signed-in user can host.
- **Search & availability** — browse listings in a responsive grid, filter by city and a check-in/check-out date range. Listings with an overlapping existing booking for those dates are automatically excluded from results.
- **Booking flow** — a property detail page with a photo gallery, description, and a booking form that computes the total price and walks the guest through a Stripe Checkout session (test mode).
- **My bookings / My listings** — guests see their reservations and can cancel upcoming ones; hosts see their listings and every reservation made against them.
- **Photo galleries** — multiple images per listing, uploaded straight from the browser to S3 via short-lived presigned URLs (the file never touches the Next.js server).
- **Graceful degradation** — if AWS or Stripe credentials aren't set, the app still builds and runs: photo upload shows a clear "not configured" message instead of crashing, and booking checkout falls back to an instant simulated confirmation.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM (works with any Postgres — production target is hosted Neon) |
| Auth | Custom JWT (jsonwebtoken) + bcrypt (bcryptjs), httpOnly cookie |
| File storage | AWS S3 via AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`), presigned direct uploads |
| Payments | Stripe test mode (`stripe` server SDK + `@stripe/stripe-js`), Checkout Sessions |
| Validation | Zod |

## Project structure

```
app/                    Routes (App Router) — pages and API route handlers
  api/                  REST-ish JSON endpoints (auth, listings, bookings, photos)
  listings/[id]/        Listing detail + edit pages
  listings/new/         Create-listing page
  my-bookings/          Guest reservations
  my-listings/          Host listings + reservations against them
components/             Reusable UI + client components (forms, cards, uploader)
lib/                    Server/shared logic: prisma client, auth, session, s3, stripe, validation, utils
prisma/                 schema.prisma + optional seed script
types/                  Shared, serializable TypeScript types
```

## Local development

### 1. Prerequisites

- Node.js 18.18+ and npm
- A PostgreSQL database. Two easy options:
  - **Docker (fastest):**
    ```bash
    docker run --name stayhub-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=stayhub -p 5432:5432 -d postgres:16
    ```
  - **Neon (matches production):** create a free project at [neon.tech](https://neon.tech) and copy its connection string.

### 2. Install and configure

```bash
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and JWT_SECRET
```

`AWS_*` and `STRIPE_*` variables are optional locally: leave them blank and the app runs fine — photo upload and real checkout are simply disabled with a clear in-UI message, and bookings auto-confirm instead of going through Stripe.

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npm run seed   # optional: creates two demo accounts and a handful of listings
```

Demo accounts created by the seed script (password `password123` for both):
- `host@stayhub.dev` — has listings
- `guest@stayhub.dev` — a fresh guest account

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run prisma:studio` | Browse the database in Prisma Studio |
| `npm run seed` | Seed demo data |

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Import Project** and select the repo.
3. Set the environment variables in the Vercel project settings (Production and Preview):
   - `DATABASE_URL` — your Neon (or other Postgres) connection string
   - `JWT_SECRET` — a long random string (`openssl rand -base64 48`)
   - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` — for photo uploads
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe **test mode** keys
   - `NEXT_PUBLIC_APP_URL` — your Vercel deployment URL (used to build Stripe redirect URLs)
4. Confirm `package.json` has a `postinstall` script that runs `prisma generate` (it already does in this repo) — Vercel runs `npm install` on every build, so this keeps the Prisma Client in sync with `schema.prisma` automatically.
5. Apply migrations to the production database once, from your machine (or a CI step):
   ```bash
   DATABASE_URL="<your-neon-url>" npx prisma migrate deploy
   ```
6. Deploy. Vercel will run `npm install` (triggering `prisma generate`) and then `npm run build`.

### S3 bucket notes

The presigned-upload flow expects the bucket to serve uploaded objects at `https://<bucket>.s3.<region>.amazonaws.com/<key>`, so either:
- allow public `GetObject` on the `listings/*` prefix via a bucket policy, or
- put a CloudFront distribution in front of the bucket and adjust the public URL construction in `lib/s3.ts` accordingly.

Also add a CORS rule on the bucket allowing `PUT` from your app's origin(s), e.g.:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-app.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"]
  }
]
```

## Design notes & simplifications

A few pragmatic tradeoffs, worth being upfront about for a portfolio piece:

- **Location is text, not geocoded.** City/country are plain fields with no maps or geocoding integration — search matches on city text.
- **Date picker is native.** The booking and search forms use native `<input type="date">` range fields rather than a custom calendar widget, in exchange for zero extra dependencies and full accessibility/keyboard support out of the box.
- **Booking confirmation happens on redirect back from Stripe**, not via a webhook. That's simple and safe (nothing gets double-booked if the tab is closed mid-payment — the booking just stays `PENDING`), but a production system would also listen for `checkout.session.completed` webhooks so a booking still confirms even if the customer never returns to the tab.
- **Photos are a plain string array** (`Listing.photos: string[]`) of public S3 URLs rather than a separate `Photo` table — simpler, and sufficient since photos don't need independent metadata here.
- **Roles are implicit.** There's no `Host`/`Guest` account type — any authenticated user can list a property and book one, matching how most real booking marketplaces actually work.
