import React, { useEffect, useState } from "react";
import { Users, Receipt, Target, TrendingDown, Shield } from "lucide-react";
import API from "../lib/api";
import { Card, Spinner, Badge } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { formatMoney } from "../lib/utils";

const ROLES = ["student", "premium", "admin"];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const load = () => {
    Promise.all([API.get("/admin/stats"), API.get("/admin/users")])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    const { data } = await API.put(`/admin/users/${id}/role`, { role });
    setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
  };

  if (loading) return <Spinner />;

  const cards = [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-brand-600 bg-brand-50" },
    { label: "Total Expenses", value: stats.total_expenses, icon: Receipt, color: "text-indigoo-600 bg-indigoo-50" },
    { label: "Savings Goals", value: stats.total_goals, icon: Target, color: "text-amber-600 bg-amber-100" },
    { label: "Total Spent", value: formatMoney(stats.total_spent), icon: TrendingDown, color: "text-red-600 bg-red-50" },
  ];

  const roleColor = (r) =>
    r === "admin" ? "red" : r === "premium" ? "amber" : "green";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and user management"
        action={<Badge color="red"><Shield size={12} className="mr-1" /> Admin</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}
            >
              <c.icon size={20} />
            </div>
            <p className="font-num text-2xl font-bold text-slate-900 mt-3">
              {c.value}
            </p>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">
              {c.label}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            Users ({users.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="admin-users-table">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-num text-slate-500">{u.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {u.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge color={roleColor(u.role)} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      data-testid={`role-select-${u.id}`}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-400 capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
