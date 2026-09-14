import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Receipt } from "lucide-react";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Spinner,
  Badge,
  EmptyState,
} from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { CATEGORY_COLORS, formatMoney, todayStr } from "../lib/utils";

const empty = { category: "Food", amount: "", description: "", date: todayStr() };

export default function Expenses() {
  const { user } = useAuth();
  const cur = user?.currency || "INR";
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    API.get("/expenses")
      .then((res) => setExpenses(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    API.get("/users/meta").then((res) =>
      setCategories(res.data.expense_categories)
    );
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({
      category: exp.category,
      amount: exp.amount,
      description: exp.description || "",
      date: exp.date,
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editing) {
        await API.put(`/expenses/${editing.id}`, payload);
      } else {
        await API.post("/expenses", payload);
      }
      setModalOpen(false);
      setLoading(true);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await API.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = expenses.filter((e) => {
    const matchSearch = (e.description || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter = !filter || e.category === filter;
    return matchSearch && matchFilter;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Track and manage your daily spending"
        action={
          <Button onClick={openCreate} data-testid="add-expense-button">
            <Plus size={16} /> Add Expense
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            data-testid="expense-search"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
          />
        </div>
        <select
          data-testid="expense-category-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">
            {filtered.length} transaction{filtered.length !== 1 && "s"}
          </span>
          <span className="text-sm font-semibold text-slate-700">
            Total: <span className="font-num">{formatMoney(total, cur)}</span>
          </span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses found"
            subtitle="Add your first expense to start tracking your spending."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} /> Add Expense
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((e) => (
              <div
                key={e.id}
                data-testid="expense-list-item"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{
                    backgroundColor: CATEGORY_COLORS[e.category] || "#64748B",
                  }}
                >
                  <Receipt size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {e.description || e.category}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color="slate">{e.category}</Badge>
                    <span className="text-xs text-slate-400">{e.date}</span>
                  </div>
                </div>
                <span className="font-num font-semibold text-slate-900">
                  {formatMoney(e.amount, cur)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(e)}
                    data-testid={`edit-expense-${e.id}`}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigoo-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    data-testid={`delete-expense-${e.id}`}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Expense" : "Add Expense"}
        testid="expense-modal"
      >
        <form onSubmit={save} className="space-y-4">
          <Select
            label="Category"
            testid="expense-category-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Amount"
            testid="expense-amount-input"
            type="number"
            step="0.01"
            min="0"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Description"
            testid="expense-description-input"
            placeholder="e.g. Lunch at canteen"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Date"
            testid="expense-date-input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} data-testid="save-expense-button">
              {saving ? "Saving..." : editing ? "Update" : "Add Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
