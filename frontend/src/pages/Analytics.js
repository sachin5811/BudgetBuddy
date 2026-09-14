import React, { useEffect, useState } from "react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Spinner, EmptyState } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { CATEGORY_COLORS, formatMoney, currentMonth, monthLabel } from "../lib/utils";

export default function Analytics() {
  const { user } = useAuth();
  const cur = user?.currency || "INR";
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get(`/analytics/category-spending?month=${month}`),
      API.get(`/analytics/monthly-trend?months=6`),
    ])
      .then(([c, t]) => {
        setCat(c.data);
        setTrend(t.data);
      })
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <Spinner />;

  const pieData = cat.map((c) => ({ name: c.category, value: c.amount }));
  const trendData = trend.map((t) => ({ ...t, label: monthLabel(t.month) }));
  const totalSpent = cat.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Understand your spending patterns and financial trends"
        action={
          <input
            type="month"
            data-testid="analytics-month-selector"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Category Spending
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {monthLabel(month)} · {formatMoney(totalSpent, cur)} total
          </p>
          {pieData.length === 0 ? (
            <EmptyState icon={BarChart3} title="No data for this month" />
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <RePieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label={(e) => e.name}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CATEGORY_COLORS[entry.name] || "#64748B"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(v, cur)} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Category Breakdown
          </h3>
          {pieData.length === 0 ? (
            <EmptyState icon={BarChart3} title="No expenses recorded" />
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={pieData}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip formatter={(v) => formatMoney(v, cur)} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CATEGORY_COLORS[entry.name] || "#64748B"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Income vs Expense Trend
        </h3>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
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
              <Tooltip formatter={(v) => formatMoney(v, cur)} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
