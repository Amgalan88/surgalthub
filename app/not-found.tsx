import Link from "next/link";
import { Compass } from "lucide-react";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { LogoWordmark } from "@/components/layout/Logo";

/**
 * Fallback for URLs that match no route at all. Renders outside the (site)
 * group, so it carries its own header instead of the shared navbar.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="Cargo Hub нүүр">
            <LogoWordmark size="sm" />
          </Link>
        </div>
      </header>

      <div className="flex-1">
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
      </div>
    </div>
  );
}
