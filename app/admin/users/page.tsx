import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/UsersTable";
import { getAllUsersWithEmail } from "@/lib/data/admin";
import { isPremiumActive } from "@/lib/access";

export const metadata: Metadata = { title: "Хэрэглэгчид" };

const MIGRATION_URL =
  "https://github.com/Amgalan88/surgalthub/blob/main/supabase/migrations/0014_admin_user_directory.sql";

export default async function AdminUsersPage() {
  const { users, emailsAvailable } = await getAllUsersWithEmail();
  const premiumCount = users.filter((u) => u.role !== "admin" && isPremiumActive(u)).length;

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Хэрэглэгчид</h1>
      <p className="mt-1 text-sm text-slate-500">
        Нийт {users.length} хэрэглэгч{premiumCount > 0 && `, ${premiumCount} нь Premium идэвхтэй`}.
        Premium-ийг &quot;Төлбөрүүд&quot; хэсгээс баталгаажуулна. Нууц үгээ мартсан хэрэглэгч
        нэвтрэх хуудасны &quot;Нууц үгээ мартсан уу?&quot; холбоосоор имэйлээрээ өөрөө сэргээнэ.
      </p>

      {!emailsAvailable && (
        <div className="mt-6 max-w-3xl rounded-xl border border-gold-300 bg-gold-100/60 p-4 text-sm text-navy-900">
          Имэйл, сүүлд нэвтэрсэн огноог харахын тулд{" "}
          <a href={MIGRATION_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline">
            энэ SQL-ийг
          </a>{" "}
          Supabase → SQL Editor дээр нэг удаа ажиллуулна уу.
        </div>
      )}

      <div className="mt-6">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
