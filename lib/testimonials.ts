export interface Testimonial {
  /** Real person's name, used with their permission. */
  name: string;
  /** Their role or company, e.g. "Ирээдүй карго, захирал". */
  role: string;
  quote: string;
}

/**
 * Hand-collected learner quotes. Deliberately empty until real ones exist —
 * the landing section hides itself while this is empty, and invented quotes
 * would be false advertising. Ask finishing learners directly, get their
 * permission, then add them here; five specific ones beat twenty vague ones.
 */
export const TESTIMONIALS: Testimonial[] = [];
