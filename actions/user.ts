"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, createSessionCookie } from "@/lib/auth";

export async function updateUserProfileAction(prevState: any, formData: FormData) {
  try {
    const currentUser = await requireAuth();

    const name = (formData.get("name") as string)?.trim();
    const department = (formData.get("department") as string)?.trim() || null;
    const graduationYearStr = (formData.get("graduationYear") as string)?.trim();
    const linkedinUrl = (formData.get("linkedinUrl") as string)?.trim() || null;
    const placementStatus = (formData.get("placementStatus") as string)?.trim() || "PREPARING";
    const placedCompany = (formData.get("placedCompany") as string)?.trim() || null;
    const bio = (formData.get("bio") as string)?.trim() || null;
    
    // Photo management
    const imageAction = (formData.get("imageAction") as string)?.trim() || "KEEP";
    const newImage = (formData.get("image") as string)?.trim() || null;

    if (!name || name.length < 2) {
      return { error: "Name must be at least 2 characters long." };
    }

    let graduationYear: number | null = null;
    if (graduationYearStr) {
      const parsed = parseInt(graduationYearStr, 10);
      if (isNaN(parsed) || parsed < 2015 || parsed > 2035) {
        return { error: "Please enter a valid graduation year (e.g. 2026)." };
      }
      graduationYear = parsed;
    }

    // Clean & validate LinkedIn URL if provided
    let cleanLinkedinUrl = linkedinUrl;
    if (cleanLinkedinUrl) {
      if (!cleanLinkedinUrl.startsWith("http://") && !cleanLinkedinUrl.startsWith("https://")) {
        cleanLinkedinUrl = `https://${cleanLinkedinUrl}`;
      }
      try {
        const parsedUrl = new URL(cleanLinkedinUrl);
        if (!parsedUrl.hostname.includes("linkedin.com")) {
          return { error: "Please provide a valid LinkedIn URL (e.g. https://linkedin.com/in/username)." };
        }
      } catch {
        return { error: "Please provide a valid LinkedIn URL format." };
      }
    }

    // Determine final image
    let finalImage: string | null = currentUser.image;
    if (imageAction === "REMOVE") {
      finalImage = null;
    } else if (imageAction === "UPDATE" && newImage) {
      // Validate that it is either a data URI or a valid web URL
      if (
        newImage.startsWith("data:image/") ||
        newImage.startsWith("http://") ||
        newImage.startsWith("https://")
      ) {
        finalImage = newImage;
      }
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        department,
        graduationYear,
        linkedinUrl: cleanLinkedinUrl,
        placementStatus,
        placedCompany: placementStatus === "OFFER_ACCEPTED" ? placedCompany : null,
        bio,
        image: finalImage,
      },
    });

    // Update active session cookie with updated name
    await createSessionCookie({
      userId: updated.id,
      email: updated.email,
      role: updated.role,
      name: updated.name,
    });

    revalidatePath("/", "layout");
    revalidatePath("/profile");

    return { 
      success: true, 
      message: "Profile updated successfully!",
      user: {
        name: updated.name,
        image: updated.image,
        department: updated.department,
        graduationYear: updated.graduationYear,
        placementStatus: updated.placementStatus,
        placedCompany: updated.placedCompany,
        linkedinUrl: updated.linkedinUrl,
        bio: updated.bio,
      }
    };
  } catch (err: any) {
    console.error("Update profile error:", err);
    return { error: err?.message || "Failed to update profile." };
  }
}
