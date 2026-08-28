import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { errorResponse, ApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError("An account with that email already exists.", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    const token = signAuthToken({ sub: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(60 * 60 * 24 * 7));
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
