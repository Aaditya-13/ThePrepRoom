import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const cookieStore = await cookies();
  const savedState = cookieStore.get("linkedin_oauth_state")?.value;
  const next = cookieStore.get("oauth_next")?.value || "/experiences";

  cookieStore.delete("linkedin_oauth_state");
  cookieStore.delete("oauth_next");

  if (error || !code || !state || state !== savedState) {
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "LinkedIn authentication was cancelled or failed verification.");
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;

  try {
    // Exchange authorization code for LinkedIn access token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to exchange LinkedIn OAuth code");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from LinkedIn OpenID UserInfo endpoint
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch LinkedIn user profile");
    }

    const profile = await userRes.json();
    const email = profile.email?.toLowerCase().trim();
    const name = profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim() || "Student";
    const linkedInId = profile.sub;
    const picture = profile.picture;

    if (!email) {
      throw new Error("No verified email provided by LinkedIn");
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user is an admin, prevent OAuth login to avoid bypassing 2FA
      if (user.role === "ADMIN") {
        const adminUrl = new URL("/admin/login", appUrl);
        adminUrl.searchParams.set(
          "error",
          "Administrator accounts must authenticate with email, password, and TOTP 2FA. Social login is disabled for admins."
        );
        return NextResponse.redirect(adminUrl);
      }

      // Link LinkedIn account and update image if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: "linkedin",
          oauthId: linkedInId,
          image: user.image || picture || null,
        },
      });
    } else {
      // Create new student user
      const college = await prisma.college.findFirst();
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: "STUDENT",
          oauthProvider: "linkedin",
          oauthId: linkedInId,
          image: picture || null,
          collegeId: college?.id || null,
        },
      });
    }

    // Create session cookie for student
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      authMethod: "linkedin",
    });

    const destination = new URL(next, appUrl);
    return NextResponse.redirect(destination);
  } catch (err) {
    console.error("LinkedIn OAuth callback error:", err);
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "Failed to sign in with LinkedIn. Please try again or use college email.");
    return NextResponse.redirect(errorUrl);
  }
}
