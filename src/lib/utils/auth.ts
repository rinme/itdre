/**
 * Client-safe authentication and URL utility helpers.
 */

export function getSafeRedirect(url: string | null | undefined): string {
  if (!url) return "/admin/schedules";
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("://")) {
    return url;
  }
  return "/admin/schedules";
}
