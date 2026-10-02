import Link from "next/link";
import { ArrowRight, Banknote, MessageCircleQuestion, Upload } from "lucide-react";
import { getAdminStats } from "@/lib/data/admin";
import { getPendingPaymentCount } from "@/lib/data/payments";

export default async function AdminDashboardPage() {
  const [stats, pendingPayments] = await Promise.all([
    getAdminStats(),
    getPendingPaymentCount(),
  ]);

  const todos = [
    pendingPayments > 0 && {
      href: "/admin/payments",
      icon: Banknote,
      title: `${pendingPayments} төлбөр шалгах`,
      body: "Суралцагчид төлбөрөө шилжүүлсэн гэж мэдэгдсэн. Дансаа шалгаад эрхийг нээгээрэй.",
    },
    stats.unansweredQuestions > 0 && {
      href: "/admin/questions",
      icon: MessageCircleQuestion,
      title: `${stats.unansweredQuestions} асуултад хариулах`,
      body: "Хичээлийн доор суралцагчдын үлдээсэн асуултууд хариу хүлээж байна.",
    },
    stats.publishedCourses === 0 && {
      href: "/admin/import",
      icon: Upload,
      title: "Хичээлээ оруулах",
      body: "Сайт дээр нийтлэгдсэн курс алга. Видеонуудаа нэг дор оруулаарай.",
    },
  ].filter(Boolean) as {
    href: string;
    icon: typeof Banknote;
    title: string;
    body: string;
  }[];

  const cards = [
    { label: "Нийт хэрэглэгч", value: stats.totalUsers },
    { label: "Premium идэвхтэй", value: stats.activePremium },
    { label: "Нийтлэгдсэн курс", value: `${stats.publishedCourses}/${stats.totalCourses}` },
    { label: "Курс дуусгасан", value: `${stats.completionRate}%` },
  ];

  return (
    <div className="max-w-5xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Хяналтын самбар</h1>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-slate-500">Хийх зүйлс</h2>
        {todos.length === 0 ? (
          <p className="mt-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            Бүх зүйл цэгцтэй байна. Шинэ төлбөр, асуулт ирэхэд энд гарна.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {todos.map((todo) => (
              <li key={todo.href}>
                <Link
                  href={todo.href}
                  className="group flex items-center gap-4 rounded-xl border border-gold-300 bg-gold-100/50 px-5 py-4 hover:bg-gold-100"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gold-700 ring-1 ring-gold-300">
                    <todo.icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy-900">{todo.title}</span>
                    <span className="block text-sm text-slate-600">{todo.body}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" data-tour="admin-stats">
        <h2 className="text-sm font-medium text-slate-500">Үзүүлэлт</h2>
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="flex flex-col-reverse bg-white px-5 py-5">
              <dt className="mt-1 text-sm text-slate-500">{c.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight text-navy-900">{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
