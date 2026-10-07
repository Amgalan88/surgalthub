export type UserRole = "user" | "admin";
/**
 * Legacy column: courses.track must hold one of these in the database, but the
 * site no longer groups courses by it (they follow curriculum order). New
 * courses get DEFAULT_COURSE_TRACK and the value is never shown.
 */
export type CourseTrack = "opening" | "operating" | "platform";
export const DEFAULT_COURSE_TRACK: CourseTrack = "opening";
export type PaymentStatus = "pending" | "approved" | "rejected";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string | null;
          role: UserRole;
          phone: string | null;
          premium_until: string | null;
          created_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          premium_until?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          premium_until?: string | null;
          created_at?: string;
        }
      >;
      courses: Table<
        {
          id: string;
          slug: string;
          title: string;
          description: string;
          track: CourseTrack;
          cover_image: string | null;
          published: boolean;
          price: number;
          duration_label: string | null;
          outcomes: string[];
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          description: string;
          track: CourseTrack;
          cover_image?: string | null;
          published?: boolean;
          price?: number;
          duration_label?: string | null;
          outcomes?: string[];
          created_by?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          track?: CourseTrack;
          cover_image?: string | null;
          published?: boolean;
          price?: number;
          duration_label?: string | null;
          outcomes?: string[];
          created_by?: string | null;
          created_at?: string;
        }
      >;
      lessons: Table<
        {
          id: string;
          course_id: string;
          title: string;
          content_md: string;
          video_url: string | null;
          cover_image_url: string | null;
          audio_url: string | null;
          slides_url: string | null;
          is_free_preview: boolean;
          order_index: number;
          created_at: string;
        },
        {
          id?: string;
          course_id: string;
          title: string;
          content_md: string;
          video_url?: string | null;
          cover_image_url?: string | null;
          audio_url?: string | null;
          slides_url?: string | null;
          is_free_preview?: boolean;
          order_index?: number;
          created_at?: string;
        },
        {
          id?: string;
          course_id?: string;
          title?: string;
          content_md?: string;
          video_url?: string | null;
          cover_image_url?: string | null;
          audio_url?: string | null;
          slides_url?: string | null;
          is_free_preview?: boolean;
          order_index?: number;
          created_at?: string;
        }
      >;
      enrollments: Table<
        {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
          has_paid: boolean;
        },
        {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string | null;
          has_paid?: boolean;
        },
        {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          has_paid?: boolean;
        }
      >;
      lesson_questions: Table<
        {
          id: string;
          lesson_id: string;
          user_id: string;
          body: string;
          answer: string | null;
          answered_at: string | null;
          answered_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          lesson_id: string;
          user_id: string;
          body: string;
          answer?: string | null;
          answered_at?: string | null;
          answered_by?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          body?: string;
          answer?: string | null;
          answered_at?: string | null;
          answered_by?: string | null;
          created_at?: string;
        }
      >;
      lesson_feedback: Table<
        {
          id: string;
          lesson_id: string;
          user_id: string;
          helpful: boolean;
          created_at: string;
        },
        {
          id?: string;
          lesson_id: string;
          user_id: string;
          helpful: boolean;
          created_at?: string;
        },
        {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          helpful?: boolean;
          created_at?: string;
        }
      >;
      payment_requests: Table<
        {
          id: string;
          user_id: string;
          amount: number;
          payer_name: string | null;
          status: PaymentStatus;
          admin_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          amount: number;
          payer_name?: string | null;
          status?: PaymentStatus;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          amount?: number;
          payer_name?: string | null;
          status?: PaymentStatus;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        }
      >;
      promo_codes: Table<
        {
          code: string;
          note: string | null;
          months: number;
          created_by: string | null;
          created_at: string;
          redeemed_by: string | null;
          redeemed_at: string | null;
          revoked_at: string | null;
        },
        {
          code: string;
          note?: string | null;
          months?: number;
          created_by?: string | null;
          created_at?: string;
          redeemed_by?: string | null;
          redeemed_at?: string | null;
          revoked_at?: string | null;
        },
        {
          code?: string;
          note?: string | null;
          months?: number;
          created_by?: string | null;
          created_at?: string;
          redeemed_by?: string | null;
          redeemed_at?: string | null;
          revoked_at?: string | null;
        }
      >;
      lesson_progress: Table<
        {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
        },
        {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed_at?: string;
        }
      >;
    };
    Views: {
      /** Contentless lesson metadata, safe to expose for locked lessons. */
      lesson_outline: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          is_free_preview: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      platform_stats: {
        Args: Record<string, never>;
        Returns: {
          learners: number;
          lessons_completed: number;
          courses: number;
        }[];
      };
      admin_user_directory: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string | null;
          avatar: string | null;
          last_sign_in_at: string | null;
        }[];
      };
      redeem_promo_code: {
        Args: { input_code: string };
        Returns: string;
      };
      approve_payment_request: {
        Args: { request_id: string; extend_months: number };
        Returns: boolean;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  /** Chosen animal avatar key; lives in the auth user's metadata, not this table. */
  avatar?: string | null;
};
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress =
  Database["public"]["Tables"]["lesson_progress"]["Row"];
/** Lesson metadata without any paid content — safe to render while locked. */
export type LessonOutline = Database["public"]["Views"]["lesson_outline"]["Row"];
export type LessonQuestion =
  Database["public"]["Tables"]["lesson_questions"]["Row"];
export type PaymentRequest =
  Database["public"]["Tables"]["payment_requests"]["Row"];
export type PromoCode = Database["public"]["Tables"]["promo_codes"]["Row"];
export type LessonFeedback =
  Database["public"]["Tables"]["lesson_feedback"]["Row"];
