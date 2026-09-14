import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet, Banknote } from "lucide-react";
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
import { formatMoney, todayStr } from "../lib/utils";

const empty = {
  source: "Pocket Money",
  amount: "",
  description: "",
  date: todayStr(),
};

const SOURCE_COLORS = {
  "Pocket Money": "#059669",
  Scholarship: "#4F46E5",
  Freelance: "#D97706",
  Other: "#64748B",
};

export default function Income() {
  const { user } = useAuth();
  const cur = user?.currency || "INR";
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [sources, setSources] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    API.get("/incomes")
      .then((res) => setIncomes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    API.get("/users/meta").then((res) => setSources(res.data.income_sources));
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({
      source: inc.source,
      amount: inc.amount,
      description: inc.description || "",
      date: inc.date,
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editing) {
        await API.put(`/incomes/${editing.id}`, payload);
      } else {
        await API.post("/incomes", payload);
      }
      setModalOpen(false);
      setLoading(true);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this income entry?")) return;
    await API.delete(`/incomes/${id}`);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const total = incomes.reduce((s, i) => s + i.amount, 0);
  const bySource = {};
  incomes.forEach((i) => {
    bySource[i.source] = (bySource[i.source] || 0) + i.amount;
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        subtitle="Manage your pocket money, scholarships & freelance earnings"
        action={
          <Button onClick={openCreate} data-testid="add-income-button">
            <Plus size={16} /> Add Income
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((src) => (
          <Card key={src} className="p-4" data-testid={`income-source-${src}`}>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: SOURCE_COLORS[src] || "#64748B" }}
              />
              {src}
            </div>
            <p className="font-num text-xl font-bold text-slate-900 mt-2">
              {formatMoney(bySource[src] || 0, cur)}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-500">
            {incomes.length} entr{incomes.length !== 1 ? "ies" : "y"}
          </span>
          <span className="text-sm font-semibold text-slate-700">
            Total: <span className="font-num">{formatMoney(total, cur)}</span>
          </span>
        </div>
        {incomes.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No income recorded"
            subtitle="Add your pocket money or other income to start."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} /> Add Income
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {incomes.map((i) => (
              <div
                key={i.id}
                data-testid="income-list-item"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{
                    backgroundColor: SOURCE_COLORS[i.source] || "#64748B",
                  }}
                >
                  <Banknote size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {i.description || i.source}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color="green">{i.source}</Badge>
                    <span className="text-xs text-slate-400">{i.date}</span>
                  </div>
                </div>
                <span className="font-num font-semibold text-brand-600">
                  + {formatMoney(i.amount, cur)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(i)}
                    data-testid={`edit-income-${i.id}`}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigoo-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(i.id)}
                    data-testid={`delete-income-${i.id}`}
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
        title={editing ? "Edit Income" : "Add Income"}
        testid="income-modal"
      >
        <form onSubmit={save} className="space-y-4">
          <Select
            label="Source"
            testid="income-source-input"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="Amount"
            testid="income-amount-input"
            type="number"
            step="0.01"
            min="0"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Description"
            testid="income-description-input"
            placeholder="e.g. Monthly allowance"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Date"
            testid="income-date-input"
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
            <Button type="submit" disabled={saving} data-testid="save-income-button">
              {saving ? "Saving..." : editing ? "Update" : "Add Income"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
