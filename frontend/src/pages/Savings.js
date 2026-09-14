import React, { useEffect, useState } from "react";
import { Plus, Target, Trash2, PiggyBank, Trophy } from "lucide-react";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  Button,
  Input,
  Modal,
  Spinner,
  Badge,
  ProgressBar,
  EmptyState,
} from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { formatMoney } from "../lib/utils";

const empty = { title: "", target_amount: "", saved_amount: "", deadline: "" };

export default function Savings() {
  const { user } = useAuth();
  const cur = user?.currency || "INR";
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  const load = () => {
    API.get("/savings")
      .then((res) => setGoals(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      target_amount: parseFloat(form.target_amount),
      saved_amount: parseFloat(form.saved_amount) || 0,
      deadline: form.deadline || null,
    };
    try {
      await API.post("/savings", payload);
      setModalOpen(false);
      setForm(empty);
      setLoading(true);
      load();
    } finally {
      setSaving(false);
    }
  };

  const deposit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/savings/${depositModal.id}/deposit`, {
        amount: parseFloat(depositAmount),
      });
      setDepositModal(null);
      setDepositAmount("");
      setLoading(true);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    await API.delete(`/savings/${id}`);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Goals"
        subtitle="Set targets and watch your savings grow"
        action={
          <Button
            onClick={() => {
              setForm(empty);
              setModalOpen(true);
            }}
            data-testid="add-goal-button"
          >
            <Plus size={16} /> New Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            subtitle="Create a goal like 'New Laptop Fund' or 'Japan Trip' and start saving."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Create Goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {goals.map((g) => (
            <Card
              key={g.id}
              data-testid="savings-goal-card"
              className="p-6 relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  {g.is_completed ? <Trophy size={22} /> : <PiggyBank size={22} />}
                </div>
                <button
                  onClick={() => remove(g.id)}
                  data-testid={`delete-goal-${g.id}`}
                  className="p-2 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mt-4">
                {g.title}
              </h3>
              {g.deadline && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Target date: {g.deadline}
                </p>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-num font-semibold text-slate-800">
                    {formatMoney(g.saved_amount, cur)}
                  </span>
                  <span className="font-num text-slate-400">
                    of {formatMoney(g.target_amount, cur)}
                  </span>
                </div>
                <ProgressBar
                  value={g.progress}
                  color={g.is_completed ? "#059669" : "#4F46E5"}
                />
                <div className="flex items-center justify-between mt-2">
                  <Badge color={g.is_completed ? "green" : "indigo"}>
                    {g.is_completed ? "Completed 🎉" : `${g.progress}% saved`}
                  </Badge>
                  {!g.is_completed && (
                    <button
                      onClick={() => {
                        setDepositModal(g);
                        setDepositAmount("");
                      }}
                      data-testid={`deposit-goal-${g.id}`}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-500"
                    >
                      + Add funds
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Savings Goal"
        testid="goal-modal"
      >
        <form onSubmit={create} className="space-y-4">
          <Input
            label="Goal Title"
            testid="goal-title-input"
            placeholder="e.g. New Laptop Fund"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Target Amount"
            testid="goal-target-input"
            type="number"
            step="0.01"
            min="1"
            required
            value={form.target_amount}
            onChange={(e) =>
              setForm({ ...form, target_amount: e.target.value })
            }
          />
          <Input
            label="Starting Amount (optional)"
            testid="goal-saved-input"
            type="number"
            step="0.01"
            min="0"
            value={form.saved_amount}
            onChange={(e) => setForm({ ...form, saved_amount: e.target.value })}
          />
          <Input
            label="Target Date (optional)"
            testid="goal-deadline-input"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} data-testid="save-goal-button">
              {saving ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!depositModal}
        onClose={() => setDepositModal(null)}
        title={`Add funds to ${depositModal?.title || ""}`}
        testid="deposit-modal"
      >
        <form onSubmit={deposit} className="space-y-4">
          <Input
            label="Deposit Amount"
            testid="deposit-amount-input"
            type="number"
            step="0.01"
            min="1"
            required
            autoFocus
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDepositModal(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} data-testid="confirm-deposit-button">
              {saving ? "Adding..." : "Add Funds"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
