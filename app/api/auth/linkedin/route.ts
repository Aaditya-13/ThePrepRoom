import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const next = searchParams.get("next") || "/experiences";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const returnUrl = new URL("/login", appUrl);
    returnUrl.searchParams.set(
      "oauth_notice",
      "LinkedIn OAuth credentials (LINKEDIN_CLIENT_ID) are not configured in .env. Please sign in with your email or configure LinkedIn developer credentials."
    );
    return NextResponse.redirect(returnUrl);
  }

  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  cookieStore.set("oauth_next", next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;
  const linkedInAuthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  linkedInAuthUrl.searchParams.set("response_type", "code");
  linkedInAuthUrl.searchParams.set("client_id", clientId);
  linkedInAuthUrl.searchParams.set("redirect_uri", redirectUri);
  linkedInAuthUrl.searchParams.set("scope", "openid profile email");
  linkedInAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(linkedInAuthUrl.toString());
}
