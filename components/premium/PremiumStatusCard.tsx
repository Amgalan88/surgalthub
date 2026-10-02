import Link from "next/link";
import { Crown, Infinity as InfinityIcon, TriangleAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPremiumDate,
  isPremiumActive,
  premiumDaysRemaining,
  PREMIUM_EXPIRY_WARNING_DAYS,
} from "@/lib/access";
import type { Profile } from "@/lib/types";

/**
 * Shows the viewer where they stand on Premium. Rendered on the dashboard and
 * on /premium so a paying user always has a visible receipt for what they bought.
 */
export function PremiumStatusCard({
  profile,
  showLink = false,
  className,
}: {
  profile: Profile;
  showLink?: boolean;
  className?: string;
}) {
  if (profile.role === "admin") {
    return (
      <div
        className={cn(
          "rounded-xl bg-navy-900 p-5 text-white ring-1 ring-inset ring-white/10",
          className
        )}
      >
        <p className="flex items-center gap-2 font-semibold">
          <InfinityIcon size={18} className="text-gold-300" />
          Хугацаагүй хандалт
        </p>
        <p className="mt-1 text-sm text-slate-300">
          Та админ эрхтэй тул бүх хичээл ямар ч хязгааргүй нээлттэй.
        </p>
      </div>
    );
  }

  const active = isPremiumActive(profile);
  const daysLeft = premiumDaysRemaining(profile);
  const expiringSoon = daysLeft !== null && daysLeft <= PREMIUM_EXPIRY_WARNING_DAYS;

  if (active && profile.premium_until) {
    return (
      <div
        className={cn(
          "rounded-xl p-5 ring-1 ring-inset",
          expiringSoon
            ? "bg-amber-50 ring-amber-600/20"
            : "bg-emerald-50 ring-emerald-600/20",
          className
        )}
      >
        <p
          className={cn(
            "flex items-center gap-2 font-semibold",
            expiringSoon ? "text-amber-800" : "text-emerald-800"
          )}
        >
          {expiringSoon ? <TriangleAlert size={18} /> : <Crown size={18} />}
          Premium эрх идэвхтэй
        </p>
        <p
          className={cn(
            "mt-1 text-sm",
            expiringSoon ? "text-amber-800/90" : "text-emerald-800/90"
          )}
        >
          {formatPremiumDate(profile.premium_until)} хүртэл бүх хичээл нээлттэй
          {daysLeft !== null && <> — {daysLeft} хоног үлдсэн</>}.
        </p>
        {expiringSoon && (
          <p className="mt-2 text-sm font-medium text-amber-800">
            Хугацаа дуусахад үнэгүй хичээлүүд болон таны аль хэдийн үзсэн
            хичээлүүд нээлттэй хэвээр үлдэнэ.
          </p>
        )}
        {showLink && (
          <Link
            href="/premium"
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 text-sm font-semibold",
              expiringSoon ? "text-amber-900" : "text-emerald-900"
            )}
          >
            Сунгах заавар <ArrowRight size={15} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-brand-50 p-5 ring-1 ring-inset ring-brand-600/20",
        className
      )}
    >
      <p className="flex items-center gap-2 font-semibold text-brand-800">
        <Crown size={18} />
        Premium эрх идэвхгүй
      </p>
      <p className="mt-1 text-sm text-brand-800/90">
        Та одоогоор зөвхөн үнэгүй хичээлүүд болон өмнө нь үзсэн хичээлүүдээ үзэх
        боломжтой.
      </p>
      {showLink && (
        <Link
          href="/premium"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Premium нээх <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
