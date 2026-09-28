"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import AuraLogo from "@/components/AuraLogo";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed. Please try again.");
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
    <div className="min-h-screen bg-[#060714] flex selection:bg-brand-500/30">
      {/* ── Left Side: Brand & Value Prop (Hidden on Mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-slate-900/40 border-r border-white/5">
        {/* Abstract Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
              <AuraLogo className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-white text-2xl tracking-tight">
              Aura <span className="gradient-text">Wealth</span> AI
            </span>
          </Link>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            The smartest way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400">
              track prize bonds.
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 max-w-md leading-relaxed">
            Stop checking PDFs manually. Join thousands of investors using AI to automatically scan and verify their bonds.
          </p>

          <div className="space-y-5">
            {[
              "AI-powered camera scanning",
              "Bulk PDF checking instantly",
              "Official State Bank results",
              "Real-time currency exchange rates"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md mt-12">
          <div className="flex gap-4">
            <Sparkles className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-bold mb-1">New AI Features Included</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Upload a PDF list of your bonds and instantly check thousands of numbers against official draw results in milliseconds.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 blur-[110px] rounded-full pointer-events-none lg:hidden" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
                <AuraLogo className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                Aura <span className="gradient-text">Wealth</span> AI
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Sign in to your Aura Wealth Terminal account
            </p>
          </div>

          <div className="premium-card p-8">
            {error && (
              <div className="mb-6 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="form-label mb-0">Password</label>
                  <Link href="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="input-field pl-10 pr-11"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? "Signing in…" : "Sign In"}</span>
              </button>

              {/* Instant Demo Access Button */}
              <div className="relative my-4 pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold">
                  <span className="bg-[#0b102b] px-3 text-slate-400 tracking-wider">Or</span>
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
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 hover:from-emerald-500/20 hover:to-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/5 hover:scale-[1.01]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1-Click Demo Login</span>
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>End-to-end encrypted · SBP verified data</span>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
              Create one free &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
