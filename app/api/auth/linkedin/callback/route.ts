import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const cookieStore = await cookies();
  const savedState = cookieStore.get("linkedin_oauth_state")?.value;
  const next = cookieStore.get("oauth_next")?.value || "/experiences";

  cookieStore.delete("linkedin_oauth_state");
  cookieStore.delete("oauth_next");

  if (error || !code || !state || state !== savedState) {
    console.error("LinkedIn OAuth error or state mismatch:", { error, errorDescription, state, savedState });
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set(
      "error",
      errorDescription || "LinkedIn authentication was cancelled or failed verification."
    );
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;

  try {
    // 1. Exchange authorization code for LinkedIn access token
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
      const errBody = await tokenRes.text();
      console.error("LinkedIn token exchange failed:", errBody);
      throw new Error(`Failed to exchange LinkedIn OAuth code: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    let email: string | undefined;
    let name: string | undefined;
    let linkedInId: string | undefined;
    let picture: string | undefined;

    // 2. Try fetching from LinkedIn OpenID UserInfo endpoint
    try {
      const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (userRes.ok) {
        const profile = await userRes.json();
        email = profile.email?.toLowerCase().trim();
        name = profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim() || "Student";
        linkedInId = profile.sub;
        picture = profile.picture;
      }
    } catch (userInfoErr) {
      console.warn("LinkedIn userinfo fetch error, falling back to id_token:", userInfoErr);
    }

    // 3. Fallback to decoding id_token JWT if userinfo was unavailable
    if ((!email || !linkedInId) && idToken) {
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
          const idData = JSON.parse(payloadJson);
          email = email || idData.email?.toLowerCase().trim();
          name = name || idData.name || `${idData.given_name || ""} ${idData.family_name || ""}`.trim() || "Student";
          linkedInId = linkedInId || idData.sub;
          picture = picture || idData.picture;
        }
      } catch (jwtErr) {
        console.error("Failed to parse LinkedIn id_token:", jwtErr);
      }
    }

    if (!email) {
      throw new Error("No verified email received from LinkedIn account.");
    }

    // 4. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Link LinkedIn account and update image if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: "linkedin",
          oauthId: linkedInId || user.oauthId,
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
          oauthProvider: "linkedin",
          oauthId: linkedInId || null,
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
      authMethod: "linkedin",
    });

    const destination = new URL(next, appUrl);
    return NextResponse.redirect(destination);
  } catch (err: any) {
    console.error("LinkedIn OAuth callback error:", err);
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set(
      "error",
      err?.message || "Failed to sign in with LinkedIn. Please try again or use college email."
    );
    return NextResponse.redirect(errorUrl);
  }
}
