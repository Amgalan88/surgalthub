/**
 * Animal avatars learners pick for their profile. Stored by key in the auth
 * user's metadata, so no database change is needed. Background classes are
 * written out in full so Tailwind keeps them.
 */
export const AVATARS = [
  { key: "horse", emoji: "🐎", label: "Морь", bg: "bg-amber-100" },
  { key: "camel", emoji: "🐫", label: "Тэмээ", bg: "bg-orange-100" },
  { key: "eagle", emoji: "🦅", label: "Бүргэд", bg: "bg-sky-100" },
  { key: "wolf", emoji: "🐺", label: "Чоно", bg: "bg-slate-200" },
  { key: "bear", emoji: "🐻", label: "Баавгай", bg: "bg-yellow-100" },
  { key: "fox", emoji: "🦊", label: "Үнэг", bg: "bg-orange-50" },
  { key: "tiger", emoji: "🐯", label: "Бар", bg: "bg-amber-50" },
  { key: "lion", emoji: "🦁", label: "Арслан", bg: "bg-yellow-50" },
  { key: "panda", emoji: "🐼", label: "Панда", bg: "bg-emerald-50" },
  { key: "owl", emoji: "🦉", label: "Шар шувуу", bg: "bg-stone-100" },
  { key: "rabbit", emoji: "🐰", label: "Туулай", bg: "bg-pink-50" },
  { key: "cat", emoji: "🐱", label: "Муур", bg: "bg-rose-50" },
  { key: "dog", emoji: "🐶", label: "Нохой", bg: "bg-lime-50" },
  { key: "penguin", emoji: "🐧", label: "Оцон шувуу", bg: "bg-cyan-50" },
  { key: "turtle", emoji: "🐢", label: "Яст мэлхий", bg: "bg-green-100" },
  { key: "frog", emoji: "🐸", label: "Мэлхий", bg: "bg-teal-50" },
] as const;

export type AvatarKey = (typeof AVATARS)[number]["key"];
export type AvatarOption = (typeof AVATARS)[number];

export function isAvatarKey(value: unknown): value is AvatarKey {
  return AVATARS.some((a) => a.key === value);
}

/**
 * The learner's chosen animal, or a stable one picked from their id so the
 * profile never shows an empty circle before they choose.
 */
export function avatarFor(userId: string, chosen?: string | null): AvatarOption {
  const picked = AVATARS.find((a) => a.key === chosen);
  if (picked) return picked;
  let hash = 0;
  for (const ch of userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length];
}
