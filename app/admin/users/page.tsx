import { UsersTable } from "@/components/admin/UsersTable";
import { getAllUsersWithEmail } from "@/lib/data/admin";

export default async function AdminUsersPage() {
  const users = await getAllUsersWithEmail();

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Хэрэглэгчид</h1>
      <p className="mt-1 text-slate-500">
        Нийт {users.length} хэрэглэгч. Төлбөрийг ихэвчлэн &quot;Төлбөрүүд&quot; хэсгээс
        баталгаажуулна. Эндээс Premium-ийг гараар нээх, цуцлах боломжтой.
      </p>

      <div className="mt-8">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
