import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Reads and verifies the auth cookie for the current request. Safe to call
 * from Server Components and Route Handlers. Returns null when there is no
 * valid session — callers decide whether that's an error or just "logged
 * out".
 */
export async function getSessionPayload(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

/**
 * Loads the full current user record from the database, or null if not
 * authenticated. Excludes the password hash.
 */
export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true },
  });

  return user;
}

/**
 * Same as getCurrentUser, but throws a typed error API routes can catch and
 * turn into a 401 response.
 */
export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
