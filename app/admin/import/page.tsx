import type { Metadata } from "next";
import { BulkImport } from "@/components/admin/BulkImport";

export const metadata: Metadata = { title: "Хичээл оруулах" };

export default function AdminImportPage() {
  return (
    <div className="max-w-4xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Хичээл бөөнөөр оруулах</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        Компьютер дээрх хичээлийн фолдероос бүх видеог нэг дор Cloudinary руу оруулж,
        курс, хичээлүүдийг үүсгэнэ. Хичээлийн нэр, дараалал, үнэгүй хичээлийн тоо{" "}
        <code className="text-xs">scripts/hicheel.json</code> файлаас авна.
      </p>
      <div className="mt-6">
        <BulkImport />
      </div>
    </div>
  );
}
