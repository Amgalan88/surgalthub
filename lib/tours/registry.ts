export interface TourStep {
  target: string;
  title?: string;
  content: string;
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end"
    | "auto"
    | "center";
}

export interface Tour {
  id: string;
  steps: TourStep[];
}

const sel = (tour: string) => `[data-tour="${tour}"]`;

const adminDashboardTour: Tour = {
  id: "admin-dashboard",
  steps: [
    {
      target: sel("admin-stats"),
      title: "Ерөнхий үзүүлэлт",
      content:
        "Хэрэглэгч, курс, бүртгэлийн ерөнхий тоо баримт энд харагдана. Зүүн цэснээс курс, хэрэглэгчээ удирдаарай.",
      placement: "bottom",
    },
  ],
};

const adminCoursesTour: Tour = {
  id: "admin-courses",
  steps: [
    {
      target: sel("admin-new-course"),
      title: "Шинэ курс",
      content: "Энд дарж шинэ курс үүсгэж эхлээрэй.",
      placement: "bottom",
    },
    {
      target: sel("admin-courses-table"),
      title: "Курс удирдах",
      content:
        "Курс бүрийг эндээс нийтлэх/нуух, засах, устгах боломжтой. Курс дээр дарж хичээлийг нь удирдана.",
      placement: "top",
    },
  ],
};

const adminCourseFormTour: Tour = {
  id: "admin-course-form",
  steps: [
    {
      target: sel("course-published-field"),
      title: "Нийтлэх",
      content:
        "Үүнийг идэвхжүүлээгүй бол курс хэрэглэгчдэд харагдахгүй — бэлэн болсны дараа асаагаарай.",
      placement: "top",
    },
  ],
};

const adminLessonsTour: Tour = {
  id: "admin-lessons",
  steps: [
    {
      target: sel("admin-add-lesson"),
      title: "Хичээл нэмэх",
      content: "Энд дарж курст шинэ хичээл нэмнэ үү.",
      placement: "bottom",
    },
  ],
};

const adminLessonFormTour: Tour = {
  id: "admin-lesson-form",
  steps: [
    {
      target: sel("lesson-free-preview-field"),
      title: "Үнэгүй үзэх",
      content:
        "Үүнийг идэвхжүүлбэл төлбөртэй курсын хувьд ч энэ хичээлийг бүх бүртгүүлсэн хэрэглэгч үзэх боломжтой болно. Эхний хичээл анхдагчаар үнэгүй байдаг.",
      placement: "right",
    },
    {
      target: sel("lesson-media-block"),
      title: "Медиа нэмэх",
      content:
        "Зураг, видео, аудио, PDF слайдыг эндээс шууд байршуулж болно — автоматаар Cloudinary руу хадгалагдана.",
      placement: "top",
    },
  ],
};

const adminUsersTour: Tour = {
  id: "admin-users",
  steps: [
    {
      target: sel("admin-users-table"),
      title: "Хэрэглэгч хайх, удирдах",
      content:
        "Имэйл, утас, нэрээр хэрэглэгчээ хайж олоорой. Хэрэглэгч шилжүүлгээр төлбөрөө хийсний дараа энд 'Идэвхжүүлэх' дараад 6 сарын Premium эрх нээж өгнө. Мөн нууц үгээ мартсан хэрэглэгчид шинэ нууц үг үүсгэж өгч болно.",
      placement: "top",
    },
  ],
};

const adminQuestionsTour: Tour = {
  id: "admin-questions",
  steps: [
    {
      target: sel("admin-questions"),
      title: "Суралцагчийн асуулт",
      content:
        "Хариулт хүлээж буй асуултууд эхэнд харагдана. Таны хариулт тухайн хичээлийн хуудсанд бүх суралцагчид харагдах тул нэг удаа хариулаад олон хүнд хүрнэ.",
      placement: "top",
    },
  ],
};

// Guided tours are for the admin panel only. The public site has to explain
// itself through its layout; pop-ups on first visit got in learners' way.
const matchers: { test: RegExp; tour: Tour }[] = [
  { test: /^\/admin\/?$/, tour: adminDashboardTour },
  { test: /^\/admin\/courses\/?$/, tour: adminCoursesTour },
  { test: /^\/admin\/courses\/new\/?$/, tour: adminCourseFormTour },
  { test: /^\/admin\/courses\/[^/]+\/edit\/?$/, tour: adminCourseFormTour },
  {
    test: /^\/admin\/courses\/[^/]+\/lessons\/new\/?$/,
    tour: adminLessonFormTour,
  },
  {
    test: /^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/?$/,
    tour: adminLessonFormTour,
  },
  { test: /^\/admin\/courses\/[^/]+\/lessons\/?$/, tour: adminLessonsTour },
  { test: /^\/admin\/users\/?$/, tour: adminUsersTour },
  { test: /^\/admin\/questions\/?$/, tour: adminQuestionsTour },
];

export function getTourForPath(pathname: string): Tour | undefined {
  return matchers.find((m) => m.test.test(pathname))?.tour;
}
