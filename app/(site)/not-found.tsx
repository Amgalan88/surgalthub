import Link from "next/link";
import { Compass } from "lucide-react";
import { StatusMessage } from "@/components/layout/StatusMessage";

export default function NotFound() {
  return (
    <StatusMessage
      code="404"
      icon={Compass}
      title="Ийм хуудас олдсонгүй"
      description="Таны хайсан хуудас устсан, нэр нь өөрчлөгдсөн, эсвэл холбоос буруу байж магадгүй."
    >
      <Link
        href="/courses"
        className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Сургалтууд харах
      </Link>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        Нүүр хуудас
      </Link>
    </StatusMessage>
  );
}
