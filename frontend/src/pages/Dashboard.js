import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Spinner, Button, ProgressBar, Badge } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import {
  CATEGORY_COLORS,
  formatMoney,
  currentMonth,
  monthLabel,
} from "../lib/utils";

function StatCard({ icon: Icon, label, value, tone, testid }) {
  const tones = {
    green: "from-brand-500 to-emerald-700 text-white",
    indigo: "from-indigoo-500 to-indigoo-600 text-white",
    white: "bg-white text-slate-900 border border-slate-200/80",
  };
  const isDark = tone !== "white";
  return (
    <Card
      data-testid={testid}
      className={`p-5 relative overflow-hidden ${
        isDark ? `bg-gradient-to-br ${tones[tone]} border-0 shadow-card` : tones.white
      }`}
    >
      {isDark && (
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-wider ${
              isDark ? "text-white/70" : "text-slate-400"
            }`}
          >
            {label}
          </p>
          <p
            className={`font-num text-2xl font-bold mt-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? "bg-white/15 text-white" : "bg-brand-50 text-brand-600"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const month = currentMonth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [catSpending, setCatSpending] = useState([]);
  const [trend, setTrend] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get(`/analytics/summary?month=${month}`),
      API.get(`/analytics/category-spending?month=${month}`),
      API.get(`/analytics/monthly-trend?months=6`),
      API.get(`/savings`),
    ])
      .then(([s, c, t, g]) => {
        setSummary(s.data);
        setCatSpending(c.data);
        setTrend(t.data);
        setGoals(g.data);
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <Spinner />;

  const cur = user?.currency || "INR";
  const pieData = catSpending.map((c) => ({
    name: c.category,
    value: c.amount,
  }));
  const trendData = trend.map((t) => ({ ...t, label: monthLabel(t.month) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi, ${user?.name?.split(" ")[0] || "there"} 👋`}
        subtitle={`Your financial snapshot for ${monthLabel(month)}`}
        action={
          <Link to="/expenses">
            <Button data-testid="dashboard-add-expense">
              <Plus size={16} /> Add Expense
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={Wallet}
          label="Income"
          value={formatMoney(summary.total_income, cur)}
          tone="green"
          testid="stat-income"
        />
        <StatCard
          icon={TrendingDown}
          label="Expenses"
          value={formatMoney(summary.total_expense, cur)}
          tone="white"
          testid="stat-expense"
        />
        <StatCard
          icon={TrendingUp}
          label="Balance"
          value={formatMoney(summary.balance, cur)}
          tone="indigo"
          testid="stat-balance"
        />
        <StatCard
          icon={PiggyBank}
          label="Total Saved"
          value={formatMoney(summary.total_saved, cur)}
          tone="white"
          testid="stat-saved"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Income vs Expense
            </h3>
            <Badge color="slate">Last 6 months</Badge>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={trendData} barGap={6}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar
                  dataKey="income"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expense"
                  fill="#4F46E5"
                  radius={[6, 6, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Spending by Category
          </h3>
          {pieData.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-16">
              No expenses this month yet.
            </div>
          ) : (
            <>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <RePieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[entry.name] || "#64748B"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatMoney(v, cur)}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        fontSize: 13,
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {pieData.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[c.name] || "#64748B",
                        }}
                      />
                      {c.name}
                    </span>
                    <span className="font-num font-semibold text-slate-800">
                      {formatMoney(c.value, cur)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Savings Goals</h3>
          <Link
            to="/savings"
            className="text-sm font-semibold text-brand-600 hover:text-brand-500 flex items-center gap-1"
          >
            View all <ArrowUpRight size={15} />
          </Link>
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            <Target className="mx-auto mb-2 text-slate-300" size={28} />
            No savings goals yet. Create one to start tracking!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map((g) => (
              <div
                key={g.id}
                className="border border-slate-200 rounded-xl p-4 hover:shadow-soft transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm truncate">
                    {g.title}
                  </span>
                  {g.is_completed && <Badge color="green">Done</Badge>}
                </div>
                <div className="mt-3 mb-2">
                  <ProgressBar value={g.progress} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-num">
                    {formatMoney(g.saved_amount, cur)}
                  </span>
                  <span className="font-num">
                    {formatMoney(g.target_amount, cur)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
