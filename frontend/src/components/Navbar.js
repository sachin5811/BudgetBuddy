import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  FileText,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  X,
  PiggyBank,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";
import { Badge } from "./ui";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/income", label: "Income", icon: Wallet },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/savings", label: "Savings", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    API.get("/notifications")
      .then((res) => setUnread(res.data.filter((n) => !n.is_read).length))
      .catch(() => {});
  }, [location.pathname]);

  const nav = [...NAV];
  const isAdmin =
    user?.role === "admin" || user?.email?.toLowerCase() === "admin@budgetbuddy.com";
  if (isAdmin) {
    nav.push({ to: "/admin", label: "Admin", icon: Shield });
  }

  const roleColor =
    user?.role === "admin" ? "red" : user?.role === "premium" ? "amber" : "green";

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              data-testid="navbar-logo"
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center text-white shadow-sm">
                <PiggyBank size={20} />
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                Budget<span className="text-brand-500">Buddy</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {nav.map((item) => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/notifications"
              data-testid="nav-notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              <Bell size={19} />
              {unread > 0 && (
                <span
                  data-testid="notification-badge"
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {unread}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              data-testid="nav-profile"
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigoo-500 to-indigoo-600 flex items-center justify-center text-white text-sm font-semibold">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold text-slate-800 max-w-[110px] truncate">
                  {user?.name}
                </div>
                <Badge color={roleColor} className="!px-1.5 !py-0 capitalize">
                  {user?.role}
                </Badge>
              </div>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              data-testid="logout-button"
              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              title="Logout"
            >
              <LogOut size={19} />
            </button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              data-testid="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden pb-4 grid grid-cols-2 gap-1.5">
            {nav.concat({ to: "/profile", label: "Profile", icon: UserIcon }).map(
              (item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-slate-600 bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              }
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
