export const SITE_NAME = "Cargo Hub";

export const SITE_DESCRIPTION =
  "Карго нээх, ажиллуулах, вэбсайт ашиглах чиглэлээр практик онлайн сургалт. Өөрийн хэмнэлээр, хаанаас ч суралцаарай.";

/**
 * Public origin of the deployed site, used for canonical URLs, the sitemap and
 * links in auth emails. Set NEXT_PUBLIC_SITE_URL in production; Vercel's own
 * URL and localhost are fallbacks so previews and dev still work.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export function hasConfiguredSiteUrl(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL
  );
}

/**
 * Only same-site paths are allowed as a post-login destination. Anything else
 * ("https://evil.com", "//evil.com", "/\evil.com") would turn the login form
 * into an open redirect usable in phishing links.
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if ([...value].some((ch) => ch.charCodeAt(0) < 0x20)) return fallback;
  return value;
}
