import { Card, CardBody } from "@/components/ui/Card";
import { CourseForm } from "@/components/admin/CourseForm";
import { createCourse } from "@/lib/actions/admin/courses";

export default function NewCoursePage() {
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Шинэ курс үүсгэх</h1>

      <Card className="mt-8">
        <CardBody>
          <CourseForm action={createCourse} />
        </CardBody>
      </Card>
    </div>
  );
}
