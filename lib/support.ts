/**
 * Where a stuck learner, or one who has just paid, should be sent. Read from
 * env so it can be set per deployment without a code change; every button
 * that uses it hides itself while it is empty, so nothing points somewhere
 * wrong.
 */
export const SUPPORT_CONTACT = {
  /**
   * Messenger link, e.g. "https://m.me/<facebook-page-username>". Needs a
   * Facebook Page with a username set, not a personal profile.
   */
  messenger: process.env.NEXT_PUBLIC_SUPPORT_MESSENGER_URL?.trim() ?? "",
  /** Shown as a tel: link on mobile, e.g. "99112233". */
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() ?? "",
  /** e.g. "info@cargohub.mn". */
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "",
};

export function hasSupportContact(): boolean {
  return Boolean(
    SUPPORT_CONTACT.messenger || SUPPORT_CONTACT.phone || SUPPORT_CONTACT.email
  );
}
