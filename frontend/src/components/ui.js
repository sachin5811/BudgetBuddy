import React from "react";
import { X } from "lucide-react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-400/40";
  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20",
    secondary: "bg-indigoo-500 text-white hover:bg-indigoo-600",
    outline:
      "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = "", testid, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </span>
      )}
      <input
        data-testid={testid}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = "", testid, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </span>
      )}
      <select
        data-testid={testid}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({ children, color = "slate", className = "" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-brand-50 text-brand-600",
    indigo: "bg-indigoo-50 text-indigoo-600",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, testid }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid={testid}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-card border border-slate-200 animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            data-testid="modal-close-button"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, color = "#059669" }) {
  const pct = Math.min(Math.max(value || 0, 0), 100);
  return (
    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Icon size={26} />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-700">{title}</h4>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
