export type UserRole = "user" | "admin";
export type CourseTrack = "opening" | "operating" | "platform";

export interface QuizOption {
  text: string;
}

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
          created_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
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
      quiz_questions: Table<
        {
          id: string;
          course_id: string;
          question: string;
          options: QuizOption[];
          correct_index: number;
          order_index: number;
        },
        {
          id?: string;
          course_id: string;
          question: string;
          options: QuizOption[];
          correct_index: number;
          order_index?: number;
        },
        {
          id?: string;
          course_id?: string;
          question?: string;
          options?: QuizOption[];
          correct_index?: number;
          order_index?: number;
        }
      >;
      quiz_attempts: Table<
        {
          id: string;
          user_id: string;
          course_id: string;
          score: number;
          passed: boolean;
          attempted_at: string;
        },
        {
          id?: string;
          user_id: string;
          course_id: string;
          score: number;
          passed: boolean;
          attempted_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          course_id?: string;
          score?: number;
          passed?: boolean;
          attempted_at?: string;
        }
      >;
      certificates: Table<
        {
          id: string;
          user_id: string;
          course_id: string;
          certificate_no: string;
          issued_at: string;
        },
        {
          id?: string;
          user_id: string;
          course_id: string;
          certificate_no: string;
          issued_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          course_id?: string;
          certificate_no?: string;
          issued_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress =
  Database["public"]["Tables"]["lesson_progress"]["Row"];
export type QuizQuestion =
  Database["public"]["Tables"]["quiz_questions"]["Row"];
export type QuizAttempt =
  Database["public"]["Tables"]["quiz_attempts"]["Row"];
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];

export const TRACK_LABELS: Record<CourseTrack, string> = {
  opening: "Карго нээх",
  operating: "Карго ажиллуулах",
  platform: "Карго вэбсайт ашиглах",
};
