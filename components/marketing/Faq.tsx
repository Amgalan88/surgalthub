import { ChevronDown } from "lucide-react";
import { formatMNT, PREMIUM_DURATION_MONTHS, PREMIUM_PRICE_MNT } from "@/lib/access";

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Бүртгүүлэхгүйгээр үзэж болох уу?",
    a: "Тийм. Курс бүрийн эхний хичээлийг бүртгэлгүйгээр шууд үзнэ. Үзсэн хичээлээ хадгалах, багшаас асуулт асуухын тулд үнэгүй бүртгүүлэхэд хангалттай.",
  },
  {
    q: "Төлбөрөө хэрхэн төлөх вэ?",
    a: `${formatMNT(PREMIUM_PRICE_MNT)}-г дансаар шилжүүлээд гүйлгээний баримтаа илгээнэ. Админ шалгаж баталгаажуулмагц бүх хичээл таны бүртгэл дээр нээгдэнэ.`,
  },
  {
    q: "Premium хэр удаан хүчинтэй вэ?",
    a: `${PREMIUM_DURATION_MONTHS} сар. Энэ хугацаанд бүх курсын бүх хичээлийг хүссэн үедээ, хэдэн ч удаа үзнэ. Хугацаа дууссаны дараа таны үзэж дуусгасан хичээлүүд нээлттэй хэвээр үлдэнэ.`,
  },
  {
    q: "Курс тус бүрд тусад нь төлөх үү?",
    a: "Үгүй. Нэг төлбөрөөр бүх курс нээгдэнэ.",
  },
  {
    q: "Утсаараа үзэж болох уу?",
    a: "Болно. Сайт утас, таблет, компьютер дээр адилхан ажиллана. Тусдаа апп суулгах шаардлагагүй.",
  },
  {
    q: "Ойлгомжгүй зүйл гарвал хэнээс асуух вэ?",
    a: "Хичээл бүрийн доор асуултаа бичиж үлдээнэ. Багш хариулахад хариулт тэр хичээл дээр харагдана.",
  },
];

export function Faq({ items = FAQ_ITEMS }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-navy-900 [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              size={18}
              className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="-mt-1 pb-5 pr-8 text-[15px] leading-relaxed text-slate-600">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
