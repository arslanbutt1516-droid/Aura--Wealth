"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, ArrowRight, ShieldCheck,
} from "lucide-react";
import AuraLogo from "@/components/AuraLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferredCurrency: "PKR",
    acceptTerms: false,
    notificationPreferences: {
      email: true,
      inApp: true,
    },
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: unknown) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.acceptTerms) {
      setError("Please accept the terms and privacy policy.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          notificationPreferences: {
            ...formData.notificationPreferences,
            whatsapp: false,
          },
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Registration failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg bg-grid-pattern flex items-center justify-center px-4 py-12">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-sky-500/15 blur-[110px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-violet-600/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
              <AuraLogo className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white text-xl tracking-tight">
              Aura <span className="gradient-text">Wealth</span> AI
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Free forever · No credit card required
          </p>
        </div>

        {/* Card */}
        <div className="premium-card p-8">
          {error && (
            <div className="mb-5 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  className="input-field pl-10"
                  placeholder="Arslan Ahmed"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="form-label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  className="input-field pl-10"
                  placeholder="03001234567"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-password"
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    className="input-field pl-10 pr-10"
                    placeholder="Min 8 chars"
                    value={formData.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="form-label">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    className="input-field pl-10 pr-10"
                    placeholder="Repeat"
                    value={formData.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Preferred Currency */}
            <div>
              <label htmlFor="currency" className="form-label">Preferred Currency</label>
              <select
                id="currency"
                className="input-field"
                value={formData.preferredCurrency}
                onChange={(e) => update("preferredCurrency", e.target.value)}
              >
                {["PKR", "USD", "EUR", "GBP", "AED", "SAR", "CAD", "AUD"].map((c) => (
                  <option key={c} value={c} className="bg-[#080d1f]">{c}</option>
                ))}
              </select>
            </div>

            {/* Notification Preferences */}
            <div>
              <p className="form-label mb-2.5">Notification Preferences</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "email", label: "📧 Email" },
                  { key: "inApp", label: "🔔 In-App" },
                ].map((pref) => (
                  <label
                    key={pref.key}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-sm font-semibold cursor-pointer transition-all ${
                      formData.notificationPreferences[
                        pref.key as keyof typeof formData.notificationPreferences
                      ]
                        ? "border-sky-500/50 bg-sky-500/10 text-sky-400"
                        : "border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={
                        formData.notificationPreferences[
                          pref.key as keyof typeof formData.notificationPreferences
                        ]
                      }
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          notificationPreferences: {
                            ...p.notificationPreferences,
                            [pref.key]: e.target.checked,
                          },
                        }))
                      }
                    />
                    {formData.notificationPreferences[
                      pref.key as keyof typeof formData.notificationPreferences
                    ] && <CheckCircle className="w-3.5 h-3.5" />}
                    {pref.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-lg border-2 mt-0.5 flex-shrink-0 transition-all ${
                  formData.acceptTerms
                    ? "bg-sky-500 border-sky-500"
                    : "border-white/20 group-hover:border-sky-500/50"
                } flex items-center justify-center`}
                onClick={() => update("acceptTerms", !formData.acceptTerms)}
              >
                {formData.acceptTerms && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-sky-400 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-sky-400 hover:underline">Privacy Policy</Link>.
                I understand that Aura Wealth Terminal is an informational utility and financial
                results should be verified with official sources.
              </span>
            </label>

            <button
              id="register-submit"
              type="submit"
              disabled={loading || !formData.acceptTerms}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>{loading ? "Creating Account…" : "Create Free Account"}</span>
            </button>

            {/* Instant Demo Access Button */}
            <div className="relative my-4 pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-[#0b102b] px-2.5 text-slate-400">Or Skip Signup</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  const res = await fetch("/api/auth/demo", { method: "POST" });
                  const data = await res.json();
                  if (data.success) {
                    window.location.href = "/dashboard";
                    return;
                  }
                  setError(data.error || "Demo login failed");
                } catch {
                  setError("Connection error. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-sky-500/15 to-indigo-500/20 hover:from-emerald-500/30 hover:to-sky-500/25 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>⚡ 1-Click Instant Demo Access (Explore Dashboard)</span>
            </button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your data is encrypted and never shared</span>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
