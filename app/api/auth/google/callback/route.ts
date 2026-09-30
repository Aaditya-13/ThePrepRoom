import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  const next = cookieStore.get("oauth_next")?.value || "/experiences";

  cookieStore.delete("google_oauth_state");
  cookieStore.delete("oauth_next");

  if (error || !code || !state || state !== savedState) {
    console.error("Google OAuth error or state mismatch:", { error, state, savedState });
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "Google authentication was cancelled or failed verification.");
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Google token exchange failed:", errText);
      throw new Error(`Failed to exchange Google OAuth code: ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    let email: string | undefined;
    let name: string | undefined;
    let googleId: string | undefined;
    let picture: string | undefined;

    // 2. Fetch user profile info from Google UserInfo endpoint
    try {
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (userRes.ok) {
        const profile = await userRes.json();
        email = profile.email?.toLowerCase().trim();
        name = profile.name || profile.given_name || "Student";
        googleId = profile.sub;
        picture = profile.picture;
      }
    } catch (userInfoErr) {
      console.warn("Google userinfo fetch error, falling back to id_token:", userInfoErr);
    }

    // 3. Fallback to decoding id_token JWT if userinfo was unavailable
    if ((!email || !googleId) && idToken) {
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
          const idData = JSON.parse(payloadJson);
          email = email || idData.email?.toLowerCase().trim();
          name = name || idData.name || idData.given_name || "Student";
          googleId = googleId || idData.sub;
          picture = picture || idData.picture;
        }
      } catch (jwtErr) {
        console.error("Failed to parse Google id_token:", jwtErr);
      }
    }

    if (!email) {
      throw new Error("No verified email provided by Google account.");
    }

    // 4. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Link Google account and update image if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: "google",
          oauthId: googleId || user.oauthId,
          image: user.image || picture || null,
        },
      });
    } else {
      // Create new student user
      const college = await prisma.college.findFirst();
      user = await prisma.user.create({
        data: {
          email,
          name: name || "Student",
          role: "STUDENT",
          oauthProvider: "google",
          oauthId: googleId || null,
          image: picture || null,
          collegeId: college?.id || null,
        },
      });
    }

    // 5. Create secure session cookie for student
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      authMethod: "google",
    });

    const destination = new URL(next, appUrl);
    return NextResponse.redirect(destination);
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set(
      "error",
      err?.message || "Failed to sign in with Google. Please try again or use college email."
    );
    return NextResponse.redirect(errorUrl);
  }
}
