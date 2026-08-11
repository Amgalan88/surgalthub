import Link from "next/link";
import { Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-navy-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Package size={16} />
              </span>
              Карго Академи
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              Карго бизнес нээх, ажиллуулах, вэбсайт ашиглах чиглэлээр
              практик мэдлэг олгох онлайн сургалтын платформ.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Чиглэл</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/courses?track=opening" className="hover:text-white">
                    Карго нээх
                  </Link>
                </li>
                <li>
                  <Link href="/courses?track=operating" className="hover:text-white">
                    Карго ажиллуулах
                  </Link>
                </li>
                <li>
                  <Link href="/courses?track=platform" className="hover:text-white">
                    Вэбсайт ашиглах
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Платформ</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Бүх сургалт
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Бүртгүүлэх
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Нэвтрэх
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Карго Академи. Бүх эрх хуулиар
          хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
