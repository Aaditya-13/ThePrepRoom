/**
 * Extracts 1-2 character initials for user avatars:
 * - If full name provided ("First Last"): takes first letter of first name and first letter of last name -> "FL"
 * - If single word ("Name"): takes first letter -> "N"
 * - Fallback: "U" (User)
 */
export function getUserInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "U";
  const trimmed = name.trim();
  if (!trimmed) return "U";

  // Split on whitespace
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}
