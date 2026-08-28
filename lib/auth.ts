import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

export const AUTH_COOKIE_NAME = "stayhub_token";

/**
 * Cookie flags for the auth cookie. `Secure` must match whether the
 * connection is actually HTTPS, not just "is this a production build" —
 * conflating the two means the cookie gets silently dropped by the browser
 * on any production deployment that isn't (yet) behind TLS. Defaults to
 * secure; set COOKIE_SECURE=false only for a deliberate plain-HTTP deploy.
 */
export function authCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true as const,
    secure: process.env.COOKIE_SECURE !== "false",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  name: string;
}

function getSecret(): string {
  if (!JWT_SECRET) {
    // Fail loudly at request time rather than silently signing with an
    // empty/guessable secret.
    throw new Error(
      "JWT_SECRET is not set. Add it to your .env file (see .env.example)."
    );
  }
  return JWT_SECRET;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}
