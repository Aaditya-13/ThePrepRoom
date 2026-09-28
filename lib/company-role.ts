import { prisma } from "./prisma";

export interface CompanyRoleVerificationResult {
  valid: boolean;
  error?: string;
  role?: {
    id: string;
    title: string;
    slug: string;
    companyId: string;
  };
}

/**
 * Enforces server-side Company -> Role relationship integrity.
 * Guarantees that the specified roleId exists and belongs to companyId.
 */
export async function verifyCompanyRoleConsistency(
  companyId: string,
  roleId: string
): Promise<CompanyRoleVerificationResult> {
  if (!companyId || !roleId) {
    return {
      valid: false,
      error: "Both companyId and roleId are required.",
    };
  }

  const role = await prisma.companyRole.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    return {
      valid: false,
      error: `Specified role with id "${roleId}" does not exist.`,
    };
  }

  if (role.companyId !== companyId) {
    return {
      valid: false,
      error: `Role "${role.title}" does not belong to the selected company. Company mismatch.`,
    };
  }

  return {
    valid: true,
    role,
  };
}
