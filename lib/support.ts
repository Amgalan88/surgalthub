/**
 * Where a stuck learner should be sent. Kept here rather than in the database
 * so it can be changed in one place without an admin screen for a single value.
 */
export const SUPPORT_CONTACT = {
  /**
   * Messenger link, e.g. "https://m.me/<facebook-page-username>". Needs a
   * Facebook Page with a username set, not a personal profile. Empty while
   * unconfigured so no button points somewhere wrong.
   */
  messenger: "",
  /** Shown as a tel: link on mobile, e.g. "99112233". Leave empty to hide. */
  phone: "",
};

export function hasSupportContact(): boolean {
  return Boolean(SUPPORT_CONTACT.messenger || SUPPORT_CONTACT.phone);
}
