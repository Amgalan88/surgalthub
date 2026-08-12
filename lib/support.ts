/**
 * Where a stuck learner should be sent. Kept here rather than in the database
 * so it can be changed in one place without an admin screen for a single value.
 */
export const SUPPORT_CONTACT = {
  /** Messenger/Facebook page URL. Leave empty to hide that option. */
  messenger: "https://m.me/cargohub.mn",
  /** Shown as a tel: link on mobile. Leave empty to hide. */
  phone: "",
};

export function hasSupportContact(): boolean {
  return Boolean(SUPPORT_CONTACT.messenger || SUPPORT_CONTACT.phone);
}
