export function isYoutubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
  } catch {
    return false;
  }
}

export function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch {
    return null;
  }
}
