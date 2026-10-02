const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

const VIDEO_ID = /^[A-Za-z0-9_-]{6,}$/;

export function isYoutubeUrl(url: string): boolean {
  try {
    return YOUTUBE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** "1m30s", "90s" or "90" → 90. */
function parseStartSeconds(raw: string | null): number | null {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);
  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return null;
  const [, h, m, s] = match;
  const total = Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
  return total > 0 ? total : null;
}

/**
 * Turns any shareable YouTube link (watch, youtu.be, Shorts, live, embed,
 * mobile) into an embeddable URL, keeping a start time when one is given.
 */
export function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!YOUTUBE_HOSTS.has(u.hostname)) return null;

    let id: string | null = null;
    const segments = u.pathname.split("/").filter(Boolean);

    if (u.hostname === "youtu.be") {
      id = segments[0] ?? null;
    } else if (u.pathname === "/watch") {
      id = u.searchParams.get("v");
    } else if (["embed", "shorts", "live", "v"].includes(segments[0] ?? "")) {
      id = segments[1] ?? null;
    }

    if (!id || !VIDEO_ID.test(id)) return null;

    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    embed.searchParams.set("rel", "0");
    const start = parseStartSeconds(
      u.searchParams.get("t") ?? u.searchParams.get("start")
    );
    if (start) embed.searchParams.set("start", String(start));
    return embed.toString();
  } catch {
    return null;
  }
}

/**
 * A still frame from a Cloudinary-hosted video, so the player shows a picture
 * instead of a black box before it starts. Null for anything else.
 */
export function cloudinaryVideoPoster(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "res.cloudinary.com" || !u.pathname.includes("/video/upload/")) {
      return null;
    }
    u.pathname = u.pathname
      .replace("/video/upload/", "/video/upload/so_2,w_1280,c_limit/")
      .replace(/\.[a-z0-9]+$/i, ".jpg");
    return u.toString();
  } catch {
    return null;
  }
}
