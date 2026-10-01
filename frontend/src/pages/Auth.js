import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  PiggyBank,
  TrendingUp,
  Target,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Mail,
  Lock,
  Check,
} from "lucide-react";
import { useAuth, formatApiErrorDetail } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

export default function Auth({ mode = "login" }) {
  const {
    user,
    login,
    sendRegisterOTP,
    checkRegisterCode,
    verifyRegisterOTP,
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resendOTP,
  } = useAuth();
  const navigate = useNavigate();

  // Active view states:
  // "login" | "register" | "register-otp" | "register-password" | "forgot-email" | "forgot-otp"
  const [view, setView] = useState(() => {
    if (mode === "register") return "register";
    if (mode === "forgot-password") return "forgot-email";
    return "login";
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode] = useState("");

  // Sync view when mode prop changes
  useEffect(() => {
    if (mode === "register") {
      setView("register");
    } else if (mode === "forgot-password") {
      setView("forgot-email");
    } else {
      setView("login");
    }
    setError("");
    setSuccess("");
    setDevCode("");
  }, [mode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (user) return <Navigate to="/dashboard" replace />;

  // 1. Submit Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const detail =
        formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Register Step 1: Send OTP to verify email (NO password yet)
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendRegisterOTP(name.trim(), email.trim());
      if (res?.dev_code) {
        setDevCode(res.dev_code);
      }
      setResendCooldown(30);
      setView("register-otp");
      setSuccess(`A 6-digit verification code was sent to ${email}`);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Register Step 2: Validate 6-digit OTP code before setting password
  const handleRegisterVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setLoading(true);
    try {
      await checkRegisterCode(email.trim(), cleanCode);
      setView("register-password");
      setSuccess("Email verified successfully! Now choose your password.");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Register Step 3: Set Password & Complete Registration
  const handleRegisterComplete = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }
    setLoading(true);
    try {
      await verifyRegisterOTP(name.trim(), email.trim(), password, otpCode.trim());
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Submit Forgot Password Step 1: Send OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendForgotPasswordOTP(email.trim());
      if (res?.dev_code) {
        setDevCode(res.dev_code);
      }
      setResendCooldown(30);
      setView("forgot-otp");
      setSuccess(`A 6-digit recovery code was sent to ${email}`);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Submit Forgot Password Step 2: Verify OTP and reset password
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit recovery code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }
    setLoading(true);
    try {
      await verifyForgotPasswordOTP(email.trim(), cleanCode, newPassword);
      setSuccess(
        "Password has been reset successfully! You can now log in with your new password."
      );
      setPassword("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      setDevCode("");
      setView("login");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP (for both register and forgot password)
  const handleResend = async (purpose) => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const res = await resendOTP(email.trim(), purpose);
      setResendCooldown(30);
      if (res?.dev_code) {
        setDevCode(res.dev_code);
      }
      setSuccess("A new 6-digit code has been sent to your email.");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setResending(false);
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
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center text-white">
              <PiggyBank size={22} />
            </div>
            <span className="text-xl font-extrabold text-slate-900">
              Budget<span className="text-brand-500">Buddy</span>
            </span>
          </div>

          {/* VIEW 1: LOGIN */}
          {view === "login" && (
            <>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 mt-2">
                Log in to manage your money.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <Input
                  label="Email"
                  testid="auth-email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div>
                  <Input
                    label="Password"
                    testid="auth-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      data-testid="auth-forgot-link"
                      onClick={() => {
                        setView("forgot-email");
                        setError("");
                        setSuccess("");
                      }}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {renderFeedback()}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="auth-submit-button"
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                New to BudgetBuddy?{" "}
                <Link
                  to="/register"
                  data-testid="auth-switch-link"
                  onClick={() => {
                    setView("register");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-500"
                >
                  Create an account
                </Link>
              </p>
            </>
          )}

          {/* VIEW 2: REGISTER STEP 1 (NAME & EMAIL ONLY - NO PASSWORD YET) */}
          {view === "register" && (
            <>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create your account
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Step 1 of 3: Enter your details to verify your email.
              </p>

              <form onSubmit={handleRegisterSendOtp} className="mt-8 space-y-4">
                <Input
                  label="Full Name"
                  testid="auth-name-input"
                  placeholder="Alex Student"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  testid="auth-email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="flex items-start gap-2 p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                  <Mail size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span>
                    A 6-digit verification code will be sent to your email to
                    verify your address before you create your password.
                  </span>
                </div>

                {renderFeedback()}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="auth-submit-button"
                >
                  {loading ? "Sending verification code..." : "Send Verification Code"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  data-testid="auth-switch-link"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-500"
                >
                  Log in
                </Link>
              </p>
            </>
          )}

          {/* VIEW 3: REGISTER STEP 2 (OTP VERIFICATION) */}
          {view === "register-otp" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setView("register");
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back to edit info
              </button>

              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Verify your email
              </h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Step 2 of 3: Enter the 6-digit code sent to{" "}
                <strong className="text-slate-800 font-semibold">{email}</strong>
              </p>

              {devCode && renderDevCodeBanner()}

              <form onSubmit={handleRegisterVerifyCode} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    data-testid="auth-otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-center font-mono text-2xl tracking-[0.35em] font-bold text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Didn't receive code?</span>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400 font-medium">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-testid="auth-resend-button"
                      disabled={resending}
                      onClick={() => handleResend("register")}
                      className="font-semibold text-brand-600 hover:text-brand-500 inline-flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw
                        size={12}
                        className={resending ? "animate-spin" : ""}
                      />{" "}
                      Resend Code
                    </button>
                  )}
                </div>

                {renderFeedback()}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="auth-submit-button"
                >
                  {loading ? "Verifying code..." : "Verify Code & Continue"}
                </Button>
              </form>
            </>
          )}

          {/* VIEW 4: REGISTER STEP 3 (SET PASSWORD AFTER VERIFICATION) */}
          {view === "register-password" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setView("register-otp");
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create password
              </h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Step 3 of 3: Your email is verified! Now set a secure password
                to finalize your account.
              </p>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check size={12} />
                </div>
                <span>
                  Verified Email: <strong>{email}</strong>
                </span>
              </div>

              <form onSubmit={handleRegisterComplete} className="mt-6 space-y-4">
                <Input
                  label="Password"
                  testid="auth-password-input"
                  type="password"
                  placeholder="•••••••• (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />

                <Input
                  label="Confirm Password"
                  testid="auth-confirm-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />

                {renderFeedback()}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="auth-submit-button"
                >
                  {loading ? "Creating account..." : "Complete Registration"}
                </Button>
              </form>
            </>
          )}

          {/* VIEW 5: FORGOT PASSWORD STEP 1 */}
          {view === "forgot-email" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Log In
              </button>

              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Reset your password
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Enter your registered email and we'll send you a 6-digit code to
                reset your password.
              </p>

              <form onSubmit={handleForgotSendOtp} className="mt-8 space-y-4">
                <Input
                  label="Registered Email"
                  testid="auth-email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                {renderFeedback()}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="auth-submit-button"
                >
                  {loading ? "Sending reset code..." : "Send Recovery Code"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Remember your password?{" "}
                <Link
                  to="/login"
                  data-testid="auth-switch-link"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-semibold text-brand-600 hover:text-brand-500"
                >
                  Log in
                </Link>
              </p>
            </>
          )}

          {/* VIEW 6: FORGOT PASSWORD STEP 2 (OTP & RESET) */}
          {view === "forgot-otp" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setView("forgot-email");
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Change email
              </button>

              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create new password
              </h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Enter the recovery code sent to{" "}
                <strong className="text-slate-800 font-semibold">{email}</strong>{" "}
                and your new password.
              </p>

              {devCode && renderDevCodeBanner()}

              <form onSubmit={handleForgotVerifyOtp} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    6-Digit Recovery Code
                  </label>
                  <input
                    data-testid="auth-otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-center font-mono text-2xl tracking-[0.35em] font-bold text-slate-800 placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 outline-none transition"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Didn't receive code?</span>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400 font-medium">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-testid="auth-resend-button"
                      disabled={resending}
                      onClick={() => handleResend("forgot_password")}
                      className="font-semibold text-brand-600 hover:text-brand-500 inline-flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw
                        size={12}
                        className={resending ? "animate-spin" : ""}
                      />{" "}
                      Resend Code
                    </button>
                  )}
                </div>

                <Input
                  label="New Password"
                  testid="auth-new-password-input"
                  type="password"
                  placeholder="•••••••• (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />

                <Input
                  label="Confirm New Password"
                  testid="auth-confirm-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />

                {renderFeedback()}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="auth-submit-button"
                >
                  {loading ? "Resetting password..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for Dev code helper badge
  function renderDevCodeBanner() {
    return (
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
        <div>
          <span className="font-semibold">Dev/Demo Mode OTP:</span>{" "}
          <span className="font-mono font-bold tracking-widest text-amber-950">
            {devCode}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOtpCode(devCode)}
          className="text-amber-700 hover:text-amber-900 underline font-semibold text-xs transition"
        >
          Auto-fill
        </button>
      </div>
    );
  }

  // Helper renderer for error and success alerts
  function renderFeedback() {
    return (
      <>
        {error && (
          <div
            data-testid="auth-error"
            className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            data-testid="auth-success"
            className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </>
    );
  }
}
