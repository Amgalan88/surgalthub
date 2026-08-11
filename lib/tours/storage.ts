const PREFIX = "cargohub_tour_seen_";

export function hasSeenTour(id: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(PREFIX + id) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + id, "1");
  } catch {
    // localStorage unavailable (private mode, etc.) — safe to ignore
  }
}
