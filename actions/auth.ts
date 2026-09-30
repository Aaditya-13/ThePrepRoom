"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createSessionCookie,
  clearSessionCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password." };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid email or password." };
  }

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    authMethod: "credentials",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function registerAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const graduationYearStr = formData.get("graduationYear") as string;

  if (!email || !password || !name) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const college = await prisma.college.findFirst();

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      department: department || null,
      graduationYear: graduationYearStr ? parseInt(graduationYearStr, 10) : null,
      role: "STUDENT",
      collegeId: college?.id || null,
    },
  });

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    authMethod: "credentials",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  return { success: true };
}
