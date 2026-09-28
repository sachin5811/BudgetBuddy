import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PiggyBank, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { useAuth, formatApiErrorDetail } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

export default function Auth({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigoo-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <PiggyBank size={22} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            BudgetBuddy
          </span>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Take control of your pocket money.
          </h1>
          <p className="text-emerald-100/80 text-lg">
            Track expenses, plan budgets, and hit your savings goals — built for
            students who want financial discipline.
          </p>
          <div className="space-y-4 pt-4">
            {[
              { icon: TrendingUp, text: "Smart expense & income tracking" },
              { icon: Target, text: "Savings goals with live progress" },
              { icon: ShieldCheck, text: "Budget alerts before you overspend" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <f.icon size={18} />
                </div>
                <span className="text-emerald-50/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-emerald-200/60">
          © 2026 BudgetBuddy. Financial freedom starts here.
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center text-white">
              <PiggyBank size={22} />
            </div>
            <span className="text-xl font-extrabold text-slate-900">
              Budget<span className="text-brand-500">Buddy</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin
              ? "Log in to manage your money."
              : "Start your financial journey today."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                testid="auth-name-input"
                placeholder="Alex Student"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email"
              testid="auth-email-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              testid="auth-password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div
                data-testid="auth-error"
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
              data-testid="auth-submit-button"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "New to BudgetBuddy? " : "Already have an account? "}
            <Link
              to={isLogin ? "/register" : "/login"}
              data-testid="auth-switch-link"
              className="font-semibold text-brand-600 hover:text-brand-500"
            >
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
