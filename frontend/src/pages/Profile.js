import React, { useState } from "react";
import { User as UserIcon, Save, Mail, Shield, Check } from "lucide-react";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Input, Select, Badge } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { CURRENCY_SYMBOLS } from "../lib/utils";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    monthly_income: user?.monthly_income || 0,
    currency: user?.currency || "INR",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await API.put("/users/profile", {
        name: form.name,
        monthly_income: parseFloat(form.monthly_income) || 0,
        currency: form.currency,
      });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const roleColor =
    user?.role === "admin" ? "red" : user?.role === "premium" ? "amber" : "green";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Profile & Settings"
        subtitle="Manage your account and financial preferences"
      />

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigoo-500 to-indigoo-600 flex items-center justify-center text-white text-2xl font-bold">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Mail size={14} /> {user?.email}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Shield size={14} className="text-slate-400" />
              <Badge color={roleColor} className="capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <UserIcon size={18} className="text-brand-500" /> Account Details
        </h3>
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Full Name"
            testid="profile-name-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Monthly Income (${CURRENCY_SYMBOLS[form.currency] || ""})`}
              testid="income-setup-input"
              type="number"
              step="0.01"
              min="0"
              value={form.monthly_income}
              onChange={(e) =>
                setForm({ ...form, monthly_income: e.target.value })
              }
            />
            <Select
              label="Currency"
              testid="profile-currency-input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {Object.keys(CURRENCY_SYMBOLS).map((c) => (
                <option key={c} value={c}>
                  {c} ({CURRENCY_SYMBOLS[c]})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} data-testid="save-profile-button">
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-brand-600">
                <Check size={16} /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
