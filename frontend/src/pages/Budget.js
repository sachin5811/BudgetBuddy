import React, { useEffect, useState } from "react";
import { Save, AlertTriangle, PieChart as PieIcon } from "lucide-react";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Spinner, ProgressBar, Badge } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { CATEGORY_COLORS, formatMoney, currentMonth, monthLabel } from "../lib/utils";

const STATUS_COLOR = { ok: "#059669", warning: "#D97706", over: "#DC2626" };

export default function Budget() {
  const { user } = useAuth();
  const cur = user?.currency || "INR";
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [overview, setOverview] = useState(null);
  const [allocations, setAllocations] = useState({});
  const [saving, setSaving] = useState(false);

  const load = (m) => {
    setLoading(true);
    Promise.all([API.get("/users/meta"), API.get(`/budgets?month=${m}`)]).then(
      ([meta, ov]) => {
        setCategories(meta.data.expense_categories);
        setOverview(ov.data);
        const alloc = {};
        meta.data.expense_categories.forEach((c) => {
          const found = ov.data.categories.find((x) => x.category === c);
          alloc[c] = found ? found.allocated : 0;
        });
        setAllocations(alloc);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    load(month);
  }, [month]);

  const save = async () => {
    setSaving(true);
    const items = Object.entries(allocations).map(([category, allocated]) => ({
      category,
      allocated: parseFloat(allocated) || 0,
    }));
    try {
      const { data } = await API.post("/budgets", { month, items });
      setOverview(data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const overspent = overview.categories.filter((c) => c.status === "over");

  const statusFor = (cat) => overview.categories.find((c) => c.category === cat);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Planner"
        subtitle="Allocate spending limits per category and track utilization"
        action={
          <input
            type="month"
            data-testid="budget-month-selector"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        }
      />

      {overspent.length > 0 && (
        <div
          data-testid="overspending-alert-banner"
          className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4"
        >
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-700">Overspending Alert</p>
            <p className="text-sm text-red-600 mt-0.5">
              You've exceeded your budget in{" "}
              {overspent.map((c) => c.category).join(", ")} for{" "}
              {monthLabel(month)}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Total Allocated
          </p>
          <p className="font-num text-2xl font-bold text-slate-900 mt-2">
            {formatMoney(overview.total_allocated, cur)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Total Spent
          </p>
          <p className="font-num text-2xl font-bold text-indigoo-600 mt-2">
            {formatMoney(overview.total_spent, cur)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Remaining
          </p>
          <p
            className={`font-num text-2xl font-bold mt-2 ${
              overview.total_allocated - overview.total_spent < 0
                ? "text-red-600"
                : "text-brand-600"
            }`}
          >
            {formatMoney(
              overview.total_allocated - overview.total_spent,
              cur
            )}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <PieIcon size={18} className="text-brand-500" /> Category Allocation
          </h3>
          <Button onClick={save} disabled={saving} data-testid="save-budget-button">
            <Save size={16} /> {saving ? "Saving..." : "Save Budget"}
          </Button>
        </div>

        <div className="space-y-5">
          {categories.map((cat) => {
            const st = statusFor(cat);
            const spent = st ? st.spent : 0;
            const alloc = parseFloat(allocations[cat]) || 0;
            const util = alloc > 0 ? Math.min((spent / alloc) * 100, 100) : 0;
            const status =
              alloc > 0 && spent >= alloc
                ? "over"
                : alloc > 0 && spent / alloc >= 0.75
                ? "warning"
                : "ok";
            return (
              <div key={cat} data-testid={`budget-row-${cat}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 font-medium text-slate-700 text-sm">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    />
                    {cat}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-num">
                      {formatMoney(spent, cur)} spent
                    </span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        Limit
                      </span>
                      <input
                        type="number"
                        min="0"
                        data-testid={`budget-category-slider`}
                        value={allocations[cat] || ""}
                        onChange={(e) =>
                          setAllocations({
                            ...allocations,
                            [cat]: e.target.value,
                          })
                        }
                        className="w-36 rounded-lg border border-slate-200 bg-white pl-12 pr-3 py-1.5 text-sm text-right font-num outline-none focus:border-brand-400"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={util} color={STATUS_COLOR[status]} />
                  </div>
                  {alloc > 0 && (
                    <Badge
                      color={
                        status === "over"
                          ? "red"
                          : status === "warning"
                          ? "amber"
                          : "green"
                      }
                    >
                      {Math.round(alloc > 0 ? (spent / alloc) * 100 : 0)}%
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
