import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAllUsers } from "@/lib/data/admin";
import { getCurrentProfile } from "@/lib/auth";
import { setUserRole } from "@/lib/actions/admin/users";

export default async function AdminUsersPage() {
  const [users, me] = await Promise.all([getAllUsers(), getCurrentProfile()]);

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-navy-900">Хэрэглэгчид</h1>
      <p className="mt-1 text-slate-500">Нийт {users.length} хэрэглэгч</p>

      <Card className="mt-8 overflow-hidden" data-tour="admin-users-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Нэр</th>
                <th className="px-5 py-3 font-medium">Утас</th>
                <th className="px-5 py-3 font-medium">Бүртгүүлсэн</th>
                <th className="px-5 py-3 font-medium">Эрх</th>
                <th className="px-5 py-3 font-medium text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u.id === me?.id;
                const toggleRole = setUserRole.bind(
                  null,
                  u.id,
                  u.role === "admin" ? "user" : "admin"
                );
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-3.5 font-medium text-navy-900">
                      {u.full_name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{u.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={u.role === "admin" ? "brand" : "slate"}>
                        {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!isSelf && (
                        <form action={toggleRole}>
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {u.role === "admin" ? "Админаас хасах" : "Админ болгох"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
