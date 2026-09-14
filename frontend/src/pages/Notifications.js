import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Trophy,
  FileText,
  PiggyBank,
} from "lucide-react";
import API from "../lib/api";
import { Card, Button, Spinner, EmptyState } from "../components/ui";
import { PageHeader } from "../components/PageHeader";

const ICONS = {
  budget: { icon: AlertTriangle, color: "text-amber-600 bg-amber-100" },
  milestone: { icon: Trophy, color: "text-brand-600 bg-brand-50" },
  report: { icon: FileText, color: "text-indigoo-600 bg-indigoo-50" },
  savings: { icon: PiggyBank, color: "text-brand-600 bg-brand-50" },
  info: { icon: Bell, color: "text-slate-600 bg-slate-100" },
};

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = () => {
    API.get("/notifications")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await API.post(`/notifications/${id}/read`);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAll = async () => {
    await API.post("/notifications/read-all");
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) return <Spinner />;

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}
        action={
          unread > 0 && (
            <Button variant="outline" onClick={markAll} data-testid="mark-all-read-button">
              <CheckCheck size={16} /> Mark all read
            </Button>
          )
        }
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            subtitle="Budget alerts, savings milestones and reports will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const cfg = ICONS[n.type] || ICONS.info;
            const Icon = cfg.icon;
            return (
              <Card
                key={n.id}
                data-testid="notification-item"
                className={`p-4 flex items-start gap-4 ${
                  !n.is_read ? "ring-1 ring-brand-400/30 bg-brand-50/30" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{n.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    data-testid={`mark-read-${n.id}`}
                    className="p-2 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 shrink-0"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
