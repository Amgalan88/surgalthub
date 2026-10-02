import Link from "next/link";
import { LogoWordmark } from "./Logo";
import { getCurrentProfile } from "@/lib/auth";
import { SupportLinks } from "@/components/SupportLinks";

export default async function Footer() {
  const profile = await getCurrentProfile();

  const links = [
    { href: "/courses", label: "Сургалтууд" },
    { href: "/premium", label: "Үнэ" },
    { href: "/#faq", label: "Түгээмэл асуулт" },
    ...(profile
      ? [{ href: "/dashboard", label: "Миний сургалт" }]
      : [
          { href: "/register", label: "Бүртгүүлэх" },
          { href: "/login", label: "Нэвтрэх" },
        ]),
  ];

  return (
    <footer className="mt-auto bg-navy-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <LogoWordmark size="sm" tone="dark" />
            <p className="mt-4 text-sm leading-relaxed">
              Карго хэрхэн ажилладаг, өдөр тутам гардаг асуудлыг хэрхэн
              шийдэхийг бодит жишээн дээр заадаг видео сургалт.
            </p>
            <SupportLinks tone="dark" className="mt-5" />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Cargo Hub
        </div>
      </div>
    </footer>
  );
}
