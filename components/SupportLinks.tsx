import { Mail, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORT_CONTACT, hasSupportContact } from "@/lib/support";

const tones = {
  light:
    "bg-white text-navy-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
  dark: "bg-white/5 text-slate-200 ring-1 ring-inset ring-white/15 hover:bg-white/10 hover:text-white",
};

/** Every configured way to reach the team, as buttons. Renders nothing when none is set. */
export function SupportLinks({
  tone = "light",
  className,
}: {
  tone?: keyof typeof tones;
  className?: string;
}) {
  if (!hasSupportContact()) return null;

  const item = cn(
    "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
    tones[tone]
  );
  const icon = tone === "light" ? "text-brand-600" : "text-brand-400";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SUPPORT_CONTACT.messenger && (
        <a
          href={SUPPORT_CONTACT.messenger}
          target="_blank"
          rel="noopener noreferrer"
          className={item}
        >
          <MessageCircle size={15} className={icon} />
          Messenger
        </a>
      )}
      {SUPPORT_CONTACT.phone && (
        <a href={`tel:${SUPPORT_CONTACT.phone.replace(/\s/g, "")}`} className={item}>
          <Phone size={15} className={icon} />
          {SUPPORT_CONTACT.phone}
        </a>
      )}
      {SUPPORT_CONTACT.email && (
        <a href={`mailto:${SUPPORT_CONTACT.email}`} className={item}>
          <Mail size={15} className={icon} />
          {SUPPORT_CONTACT.email}
        </a>
      )}
    </div>
  );
}
