/**
 * Admin authorization utility.
 * Checks whether a given user email is allowed to access the admin dashboard.
 */

export function getAdminEmails(): string[] {
  const envEmail =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_EMAIL) ||
    (typeof process !== "undefined" ? process.env.VITE_ADMIN_EMAIL : "") ||
    "";

  if (!envEmail) return [];

  return envEmail
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmails = getAdminEmails();

  // If no VITE_ADMIN_EMAIL is configured in environment, disallow access by default
  if (adminEmails.length === 0) {
    console.warn(
      "[isAdminEmail] VITE_ADMIN_EMAIL is not configured in environment variables. Denying admin access."
    );
    return false;
  }

  const normalized = email.trim().toLowerCase();
  return adminEmails.includes(normalized);
}
