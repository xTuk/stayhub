import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signAuthToken, AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { errorResponse, ApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError("Invalid email or password.", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new ApiError("Invalid email or password.", 401);
    }

    const token = signAuthToken({ sub: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 7));
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
