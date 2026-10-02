import { Check, Clock } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { formatMNT, PREMIUM_DURATION_MONTHS, PREMIUM_PRICE_MNT } from "@/lib/access";
import { cn } from "@/lib/utils";

/** Compact pitch for Premium, shown next to content a viewer cannot open yet. */
export function PremiumOffer({
  lessonCount,
  pending = false,
  className,
}: {
  /** Locked lessons in view, to make the offer concrete. */
  lessonCount?: number;
  /** The viewer already pressed "I have paid" and is waiting on the admin. */
  pending?: boolean;
  className?: string;
}) {
  if (pending) {
    return (
      <div className={cn("rounded-xl border border-gold-300 bg-gold-100/60 p-5", className)}>
        <p className="flex items-center gap-2 font-medium text-navy-900">
          <Clock size={16} className="text-gold-700" /> Төлбөрийг шалгаж байна
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          Админ баталгаажуулмагц үлдсэн хичээлүүд автоматаар нээгдэнэ.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5", className)}>
      <p className="text-sm font-medium text-slate-500">Premium</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-navy-900">
          {formatMNT(PREMIUM_PRICE_MNT)}
        </span>
        <span className="text-sm text-slate-500">/ {PREMIUM_DURATION_MONTHS} сар</span>
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {[
          lessonCount ? `Үлдсэн ${lessonCount} хичээл нээгдэнэ` : "Бүх хичээл нээгдэнэ",
          "Бүх курс нэг төлбөрт багтана",
          "Багшаас асуулт асууна",
        ].map((item) => (
          <li key={item} className="flex gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-brand-600" />
            {item}
          </li>
        ))}
      </ul>
      <LinkButton href="/premium" className="mt-5 w-full">
        Premium авах
      </LinkButton>
    </div>
  );
}
