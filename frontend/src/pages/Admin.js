import React, { useEffect, useState } from "react";
import {
  Users,
  Receipt,
  Target,
  TrendingDown,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import API, { formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Spinner, Badge } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { formatMoney } from "../lib/utils";

const ROLES = ["student", "premium", "admin"];

export default function Admin() {
  const { user: currentUser, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const load = () => {
    Promise.all([API.get("/admin/stats"), API.get("/admin/users")])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data);
      })
      .catch((err) => {
        setErrorMsg(
          formatApiErrorDetail(err.response?.data?.detail) ||
            "Failed to load admin dashboard."
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    setErrorMsg("");
    setSuccessMsg("");
    setUpdatingId(id);
    try {
      const { data } = await API.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
      if (currentUser && currentUser.id === id) {
        setUser((prev) => ({ ...prev, role: data.role }));
      }
      setSuccessMsg(`Role successfully updated to "${role}" for ${data.name || data.email}`);
      setTimeout(() => setSuccessMsg(""), 4000);
      API.get("/admin/stats")
        .then((s) => setStats(s.data))
        .catch(() => {});
    } catch (err) {
      setErrorMsg(
        formatApiErrorDetail(err.response?.data?.detail) ||
          "Failed to update role. Please try again."
      );
      setTimeout(() => setErrorMsg(""), 6000);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner />;

  const cards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-brand-600 bg-brand-50" },
    { label: "Total Expenses", value: stats?.total_expenses || 0, icon: Receipt, color: "text-indigoo-600 bg-indigoo-50" },
    { label: "Savings Goals", value: stats?.total_goals || 0, icon: Target, color: "text-amber-600 bg-amber-100" },
    { label: "Total Spent", value: formatMoney(stats?.total_spent || 0), icon: TrendingDown, color: "text-red-600 bg-red-50" },
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

      {errorMsg && (
        <div
          data-testid="admin-error-alert"
          className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl shadow-sm"
        >
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          data-testid="admin-success-alert"
          className="flex items-center gap-3 p-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm"
        >
          <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

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
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Users ({users.length})
          </h3>
          <span className="text-xs text-slate-400">
            Select a role from the dropdown to update user permissions
          </span>
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
                    <span className="flex items-center gap-2">
                      {u.name}
                      {currentUser?.id === u.id && (
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge color={roleColor(u.role)} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        data-testid={`role-select-${u.id}`}
                        disabled={updatingId === u.id}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-400 capitalize disabled:opacity-50 disabled:cursor-wait"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {updatingId === u.id && (
                        <span className="text-xs text-slate-400 animate-pulse">
                          Saving...
                        </span>
                      )}
                    </div>
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
