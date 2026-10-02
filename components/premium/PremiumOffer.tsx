import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { formatMNT, PREMIUM_DURATION_MONTHS, PREMIUM_PRICE_MNT } from "@/lib/access";
import { cn } from "@/lib/utils";

/** Compact pitch for Premium, shown next to content a viewer cannot open yet. */
export function PremiumOffer({
  lessonCount,
  className,
}: {
  /** Locked lessons in view, to make the offer concrete. */
  lessonCount?: number;
  className?: string;
}) {
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
