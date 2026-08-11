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

const landingTour: Tour = {
  id: "landing",
  steps: [
    {
      target: sel("hero-cta"),
      title: "Тавтай морил!",
      content:
        "Энд карго бизнес нээх, ажиллуулах, онлайн платформ ашиглах чиглэлээр курс олдоно. Эндээс сургалтын жагсаалт руу шууд орж болно.",
      placement: "bottom",
    },
    {
      target: sel("tracks-section"),
      title: "3 үндсэн чиглэл",
      content:
        "Та юу хийхээ мэдэхгүй байвал эндээс өөрт тохирсон чиглэлээ сонгож эхлээрэй — нээх, ажиллуулах эсвэл платформ ашиглах.",
      placement: "top",
    },
    {
      target: sel("register-cta"),
      title: "Эхлээрэй",
      content:
        "Үнэгүй бүртгүүлээд, дурын курсын эхний хичээлүүдийг шууд үзэж эхэлж болно.",
      placement: "top",
    },
  ],
};

const catalogTour: Tour = {
  id: "courses-catalog",
  steps: [
    {
      target: sel("track-filter"),
      title: "Чиглэлээр шүүх",
      content:
        "Эндээс өөрт хэрэгтэй чиглэлийн курсуудыг л шүүж харах боломжтой.",
      placement: "bottom",
    },
    {
      target: sel("course-grid"),
      title: "Курс сонгох",
      content:
        "Курс дээр дарж дэлгэрэнгүй мэдээлэл, хичээлийн жагсаалтыг харна уу.",
      placement: "top",
    },
  ],
};

const courseDetailTour: Tour = {
  id: "course-detail",
  steps: [
    {
      target: sel("lesson-roadmap"),
      title: "Сургалтын зам",
      content:
        "Хичээлүүд энд алхам алхмаар харагдана. Ногоон ✓ дууссан, шар одоо үзэх хичээл, 🔒 нь бүртгүүлээгүй эсвэл төлбөртэй хичээлийг заана.",
      placement: "right",
    },
    {
      target: sel("enroll-cta"),
      title: "Эхлэх",
      content:
        "Энд дарж курст бүртгүүлэх, эсвэл үргэлжлүүлэх боломжтой. Бүртгүүлэх нь үнэгүй — зарим хичээл premium байж болно.",
      placement: "left",
    },
  ],
};

const lessonViewerTour: Tour = {
  id: "lesson-viewer",
  steps: [
    {
      target: sel("lesson-sidebar"),
      title: "Хичээлийн жагсаалт",
      content:
        "Энэ курсын бүх хичээлийг эндээс шууд сонгож үзэж болно. ✓ тэмдэгтэй нь дууссан, 🔒 нь одоогоор нээгдээгүй хичээл.",
      placement: "right",
    },
    {
      target: sel("mark-complete-btn"),
      title: "Дуусгах",
      content:
        "Хичээлээ үзэж дуусаад энд дарж тэмдэглээрэй — таны явц шинэчлэгдэнэ.",
      placement: "top",
    },
    {
      target: sel("lesson-nav"),
      title: "Шилжих",
      content: "Өмнөх, дараагийн хичээл рүү эндээс шууд шилжиж болно.",
      placement: "top",
    },
  ],
};

const dashboardTour: Tour = {
  id: "dashboard",
  steps: [
    {
      target: sel("dashboard-courses"),
      title: "Таны сургалтууд",
      content:
        "Бүртгүүлсэн курс бүрийн явц энд харагдана. Одоогоор хоосон бол доор байгаа товчоор курс хайж бүртгүүлээрэй.",
      placement: "top",
    },
  ],
};

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

const matchers: { test: RegExp; tour: Tour }[] = [
  { test: /^\/$/, tour: landingTour },
  { test: /^\/courses\/?$/, tour: catalogTour },
  { test: /^\/courses\/[^/]+\/learn\/[^/]+\/?$/, tour: lessonViewerTour },
  { test: /^\/courses\/[^/]+\/?$/, tour: courseDetailTour },
  { test: /^\/dashboard\/?$/, tour: dashboardTour },
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
];

export function getTourForPath(pathname: string): Tour | undefined {
  return matchers.find((m) => m.test.test(pathname))?.tour;
}
