import { UsersTable } from "@/components/admin/UsersTable";
import { getAllUsersWithEmail } from "@/lib/data/admin";

export default async function AdminUsersPage() {
  const users = await getAllUsersWithEmail();

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Хэрэглэгчид</h1>
      <p className="mt-1 text-slate-500">
        Нийт {users.length} хэрэглэгч. Имэйл/утсаар хайж, төлбөр баталгаажсан
        хэрэглэгчийг 6 сарын хугацаагаар идэвхжүүлээрэй.
      </p>

      <div className="mt-8">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
