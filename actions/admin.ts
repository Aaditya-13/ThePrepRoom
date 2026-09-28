"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function createCompanyAction(data: {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
}) {
  await requireAdmin();

  if (!data.name || !data.name.trim()) {
    return { error: "Company name is required." };
  }

  const name = data.name.trim();
  const slug = slugify(name);

  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) {
    return { error: "A company with this name or slug already exists." };
  }

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      industry: data.industry?.trim() || null,
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/companies");
  return { success: true, company };
}

export async function createCompanyRoleAction(companyId: string, title: string) {
  await requireAdmin();

  if (!companyId || !title || !title.trim()) {
    return { error: "Company and role title are required." };
  }

  const roleTitle = title.trim();
  const slug = slugify(roleTitle);

  const existing = await prisma.companyRole.findUnique({
    where: {
      companyId_slug: { companyId, slug },
    },
  });

  if (existing) {
    return { error: "This role already exists for this company." };
  }

  const role = await prisma.companyRole.create({
    data: {
      companyId,
      title: roleTitle,
      slug,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/companies`);
  return { success: true, role };
}
