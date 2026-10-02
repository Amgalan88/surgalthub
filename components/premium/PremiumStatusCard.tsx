import Link from "next/link";
import { ArrowRight, Clock, Crown, Infinity as InfinityIcon, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPremiumDate,
  isPremiumActive,
  premiumDaysRemaining,
  PREMIUM_EXPIRY_WARNING_DAYS,
} from "@/lib/access";
import type { Profile } from "@/lib/types";

/**
 * Where the learner stands on Premium, in one line plus the next step: active
 * until when, waiting on the admin, or how to get it.
 */
export function PremiumStatusCard({
  profile,
  pendingSince = null,
  className,
}: {
  profile: Profile;
  /** When an "I have paid" request is waiting on the admin. */
  pendingSince?: string | null;
  className?: string;
}) {
  const active = isPremiumActive(profile);
  const daysLeft = premiumDaysRemaining(profile);
  const expiringSoon = active && daysLeft !== null && daysLeft <= PREMIUM_EXPIRY_WARNING_DAYS;

  let tone: "green" | "amber" | "blue" | "slate";
  let icon: React.ReactNode;
  let title: string;
  let body: string;
  let link: { href: string; label: string } | null = null;

  if (profile.role === "admin") {
    tone = "slate";
    icon = <InfinityIcon size={18} />;
    title = "Хугацаагүй хандалт";
    body = "Та админ эрхтэй тул бүх хичээл нээлттэй.";
  } else if (pendingSince) {
    tone = "amber";
    icon = <Clock size={18} />;
    title = "Таны төлбөрийг шалгаж байна";
    body = `${formatPremiumDate(pendingSince)}-нд илгээсэн. Баталгаажмагц бүх хичээл автоматаар нээгдэнэ.`;
  } else if (active && profile.premium_until) {
    tone = expiringSoon ? "amber" : "green";
    icon = expiringSoon ? <TriangleAlert size={18} /> : <Crown size={18} />;
    title = "Premium идэвхтэй";
    body = `${formatPremiumDate(profile.premium_until)} хүртэл бүх хичээл нээлттэй${
      daysLeft !== null ? `, ${daysLeft} хоног үлдсэн` : ""
    }.`;
    if (expiringSoon) link = { href: "/premium", label: "Сунгах" };
  } else {
    tone = "blue";
    icon = <Crown size={18} />;
    title = "Үнэгүй хичээлүүдийг үзэж байна";
    body = "Premium авбал бүх курсын бүх хичээл нээгдэнэ.";
    link = { href: "/premium", label: "Premium авах" };
  }

  const tones = {
    green: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
    amber: "border-gold-300 bg-gold-100/60 text-gold-700",
    blue: "border-brand-200 bg-brand-50/70 text-brand-800",
    slate: "border-slate-200 bg-white text-navy-900",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        tones[tone],
        className
      )}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-0.5 text-sm text-slate-700">{body}</p>
        </div>
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {link.label} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
