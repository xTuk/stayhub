import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}

let cachedClient: Stripe | null = null;

/**
 * Returns a Stripe server client, or null if STRIPE_SECRET_KEY isn't set.
 * Callers use this to fall back to a simulated "instant confirm" booking
 * flow so the app keeps working (and building) without real Stripe keys.
 */
export function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) return null;
  if (!cachedClient) {
    // No explicit apiVersion: the Stripe Node SDK's TypeScript types pin
    // apiVersion to the exact literal matching the installed package
    // version, so hardcoding a string here is a common source of build
    // breaks after a `stripe` upgrade. Omitting it uses the SDK's built-in
    // default (the API version it was built against), which is what we want.
    cachedClient = new Stripe(STRIPE_SECRET_KEY);
  }
  return cachedClient;
}
