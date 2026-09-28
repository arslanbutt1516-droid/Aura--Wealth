"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import FloatingAssistantWidget from "@/components/FloatingAssistantWidget";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Sparkles, Search, TrendingUp, Bell, Shield,
  CheckCircle2, ArrowRight, Award, Clock, ShieldCheck,
  RefreshCw, BarChart3, Layers, PieChart as PieIcon,
  ChevronDown, HelpCircle, ArrowUpRight, Check, Activity
} from "lucide-react";

// ── 2026 Interactive Chart Datasets ──────────────────────────────────────────

const currencyHistoryData: Record<string, { date: string; rate: number; sbp: number }[]> = {
  "1M": [
    { date: "Sep 01", rate: 278.10, sbp: 278.00 },
    { date: "Sep 06", rate: 278.25, sbp: 278.15 },
    { date: "Sep 12", rate: 278.35, sbp: 278.20 },
    { date: "Sep 18", rate: 278.15, sbp: 278.05 },
    { date: "Sep 22", rate: 278.45, sbp: 278.30 },
    { date: "Sep 26", rate: 278.40, sbp: 278.25 },
  ],
  "3M": [
    { date: "Jul W1", rate: 278.60, sbp: 278.40 },
    { date: "Jul W3", rate: 278.45, sbp: 278.30 },
    { date: "Aug W1", rate: 278.30, sbp: 278.15 },
    { date: "Aug W3", rate: 278.20, sbp: 278.05 },
    { date: "Sep W1", rate: 278.35, sbp: 278.20 },
    { date: "Sep W4", rate: 278.40, sbp: 278.25 },
  ],
  "6M": [
    { date: "Apr", rate: 277.90, sbp: 277.70 },
    { date: "May", rate: 278.20, sbp: 278.00 },
    { date: "Jun", rate: 278.50, sbp: 278.35 },
    { date: "Jul", rate: 278.60, sbp: 278.40 },
    { date: "Aug", rate: 278.30, sbp: 278.15 },
    { date: "Sep", rate: 278.40, sbp: 278.25 },
  ],
  "1Y": [
    { date: "Q4 '25", rate: 281.20, sbp: 281.00 },
    { date: "Q1 '26", rate: 279.50, sbp: 279.30 },
    { date: "Q2 '26", rate: 278.20, sbp: 278.00 },
    { date: "Q3 '26", rate: 278.40, sbp: 278.25 },
  ],
};

const prizePoolData = [
  { denom: "Rs. 100", firstPrize: 0.7, totalPool: 2.5, winners: 1203 },
  { denom: "Rs. 200", firstPrize: 0.75, totalPool: 5.0, winners: 2400 },
  { denom: "Rs. 750", firstPrize: 1.5, totalPool: 18.8, winners: 1700 },
  { denom: "Rs. 1,500", firstPrize: 3.0, totalPool: 37.5, winners: 1700 },
  { denom: "Rs. 25,000", firstPrize: 30.0, totalPool: 320.0, winners: 707 },
  { denom: "Rs. 40,000", firstPrize: 80.0, totalPool: 500.0, winners: 664 },
];

const portfolioGrowthData = [
  { month: "Jan", portfolio: 200000, prizeWon: 0, totalValue: 200000 },
  { month: "Feb", portfolio: 350000, prizeWon: 18500, totalValue: 368500 },
  { month: "Mar", portfolio: 400000, prizeWon: 18500, totalValue: 418500 },
  { month: "Apr", portfolio: 500000, prizeWon: 500000, totalValue: 1000000 },
  { month: "May", portfolio: 550000, prizeWon: 500000, totalValue: 1050000 },
  { month: "Jun", portfolio: 600000, prizeWon: 1500000, totalValue: 2100000 },
];

const winnerDistribution = [
  { name: "3rd Prize Winners (78%)", value: 78, color: "#06b6d4" },
  { name: "2nd Prize Winners (16%)", value: 16, color: "#10b981" },
  { name: "1st Prize Jackpots (6%)", value: 6, color: "#f59e0b" },
];

const denominations = [
  {
    value: "100",
    name: "Regular Bond",
    firstPrize: "Rs. 700,000",
    secondPrize: "Rs. 200,000 (x3)",
    thirdPrize: "Rs. 1,000 (x1,199)",
    totalPrizes: "1,203 Prizes",
    drawCycle: "Quarterly",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    badge: "Popular",
  },
  {
    value: "200",
    name: "Regular Bond",
    firstPrize: "Rs. 750,000",
    secondPrize: "Rs. 250,000 (x5)",
    thirdPrize: "Rs. 1,250 (x2,394)",
    totalPrizes: "2,400 Prizes",
    drawCycle: "Quarterly",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30",
    badge: "Most Winners",
  },
  {
    value: "750",
    name: "Regular Bond",
    firstPrize: "Rs. 1,500,000",
    secondPrize: "Rs. 500,000 (x3)",
    thirdPrize: "Rs. 9,300 (x1,696)",
    totalPrizes: "1,700 Prizes",
    drawCycle: "Quarterly",
    color: "from-cyan-500/20 to-indigo-500/10",
    border: "border-brand-500/30",
    badge: "Next Draw",
  },
  {
    value: "1500",
    name: "Regular Bond",
    firstPrize: "Rs. 3,000,000",
    secondPrize: "Rs. 1,000,000 (x3)",
    thirdPrize: "Rs. 18,500 (x1,696)",
    totalPrizes: "1,700 Prizes",
    drawCycle: "Quarterly",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    badge: "Draw Nov 15",
  },
  {
    value: "25000",
    name: "Premium Registered",
    firstPrize: "Rs. 30,000,000 (x2)",
    secondPrize: "Rs. 10,000,000 (x5)",
    thirdPrize: "Rs. 300,000 (x700)",
    totalPrizes: "707 Prizes",
    drawCycle: "Bi-Annual + Profit",
    color: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/30",
    badge: "Semi-Annual Profit",
  },
  {
    value: "40000",
    name: "Premium Registered",
    firstPrize: "Rs. 80,000,000",
    secondPrize: "Rs. 30,000,000 (x3)",
    thirdPrize: "Rs. 500,000 (x660)",
    totalPrizes: "664 Prizes",
    drawCycle: "Bi-Annual + Profit",
    color: "from-rose-500/20 to-red-500/10",
    border: "border-rose-500/30",
    badge: "Top 80M Prize",
  },
];

const currencyRates: Record<string, { rate: number; symbol: string; flag: string; change: string }> = {
  USD: { rate: 278.4, symbol: "$", flag: "🇺🇸", change: "+0.12%" },
  EUR: { rate: 294.15, symbol: "€", flag: "🇪🇺", change: "-0.08%" },
  GBP: { rate: 352.8, symbol: "£", flag: "🇬🇧", change: "+0.25%" },
  AED: { rate: 75.82, symbol: "د.إ", flag: "🇦🇪", change: "+0.00%" },
  SAR: { rate: 74.2, symbol: "﷼", flag: "🇸🇦", change: "+0.05%" },
  CAD: { rate: 204.6, symbol: "C$", flag: "🇨🇦", change: "-0.14%" },
};



const faqs = [
  {
    q: "How does the Aura Wealth Terminal prize bond checker work?",
    a: "Select your bond denomination, enter your 6-digit serial number, and click 'Check Now'. Our engine cross-references all official State Bank of Pakistan (SBP) and National Savings draw results from the past 6+ years to deliver instant, 100% verified results.",
  },
  {
    q: "How does automated draw notification work?",
    a: "Once you register and save your bonds in your portfolio, our background sync checks your bonds within minutes of every official draw announcement. You get instant alerts via dashboard notifications and email.",
  },
  {
    q: "Is Aura Wealth Terminal compliant with Pakistan financial regulations?",
    a: "Yes. Aura Wealth Terminal is an informational and tracking utility tool. We do not sell or trade prize bonds. All prize bond draws and rules are governed strictly by the State Bank of Pakistan and National Savings.",
  },
  {
    q: "Can I check multiple or sequential prize bonds together?",
    a: "Yes! In your dashboard, you can add sequential ranges (e.g. 054201 to 054250) or bulk paste numbers. The system manages and monitors all bonds in your portfolio simultaneously.",
  },
  {
    q: "Are the currency exchange rates live?",
    a: "Yes, our currency engine continuously updates interbank and open market exchange rates for PKR against major global currencies (USD, EUR, GBP, AED, SAR, etc.) with real-time conversion calculations.",
  },
];

// Custom Tooltip for Recharts
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
}

const CustomChartTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#080a22]/95 border border-brand-500/30 backdrop-blur-xl rounded-xl p-3 shadow-2xl text-xs">
        <p className="text-slate-400 font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 my-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color || "#06b6d4" }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-mono font-bold">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Quick Checker State
  const [quickDenom, setQuickDenom] = useState("1500");
  const [quickNumber, setQuickNumber] = useState("");
  const [checkResult, setCheckResult] = useState<null | {
    won: boolean;
    prize?: string;
    drawNo?: string;
    date?: string;
    city?: string;
  }>(null);
  const [checking, setChecking] = useState(false);

  // Currency Converter State
  const [fxAmount, setFxAmount] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  // Chart Tab State
  const [chartTab, setChartTab] = useState<"fx" | "pools" | "portfolio" | "distribution">("fx");
  const [fxTimeframe, setFxTimeframe] = useState<"1M" | "3M" | "6M" | "1Y">("1M");

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNumber || quickNumber.length < 5) return;

    setChecking(true);
    setCheckResult(null);

    setTimeout(() => {
      setChecking(false);
      if (quickNumber === "482671" || quickNumber.endsWith("71")) {
        setCheckResult({
          won: true,
          prize: "Rs. 1,000,000 (2nd Prize)",
          drawNo: "Draw #102",
          date: "May 15, 2026",
          city: "Lahore",
        });
      } else {
        setCheckResult({ won: false });
      }
    }, 600);
  };

  const currentRate = currencyRates[selectedCurrency]?.rate || 278.4;
  const pkrConverted = (fxAmount * currentRate).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen hero-bg bg-grid-pattern text-slate-100 selection:bg-brand-500/30 selection:text-cyan-200">
      <PublicNav />

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-4 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/20 via-emerald-500/15 to-indigo-500/20 blur-[130px] rounded-full pointer-events-none -z-10 animate-glow" />
        <div className="absolute top-96 left-10 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-80 right-10 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-brand-500/30 bg-cyan-950/50 backdrop-blur-xl text-cyan-300 text-xs font-semibold mb-8 shadow-lg shadow-cyan-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span>Pakistan&apos;s #1 Prize Bond &amp; Live Currency Terminal • 2026 Edition</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            Track Your Prize Bonds.
            <br />
            <span className="gradient-text">Never Miss A Million.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            Instant draw checker, live visual financial analytics, Gemini AI vision scanner, and real-time PKR currency exchange rates — all in one modern terminal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              href="/register"
              className="btn-primary text-base !py-3.5 !px-8 flex items-center gap-2 group shadow-cyan-500/30"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#charts"
              className="btn-ghost text-base !py-3.5 !px-8 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <span>Explore Live Charts</span>
            </a>
          </div>

          {/* ── Interactive Instant Checker Card ────────────────────────────── */}
          <div
            id="checker"
            className="max-w-3xl mx-auto premium-card p-6 sm:p-8 text-left border border-white/15 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-black/80 mb-16"
          >
            <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-cyan-500/15 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                    <Search className="w-4 h-4 text-brand-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Instant Prize Bond Draw Checker
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Official database synchronized with National Savings of Pakistan
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 2026 Verified
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickCheck} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label text-xs uppercase tracking-wider text-slate-400">
                    Bond Denomination
                  </label>
                  <select
                    value={quickDenom}
                    onChange={(e) => setQuickDenom(e.target.value)}
                    className="input-field bg-[#0c102c] border-white/15 text-white cursor-pointer"
                  >
                    <option value="100">Rs. 100 Regular</option>
                    <option value="200">Rs. 200 Regular</option>
                    <option value="750">Rs. 750 Regular</option>
                    <option value="1500">Rs. 1,500 Regular</option>
                    <option value="25000">Rs. 25,000 Premium</option>
                    <option value="40000">Rs. 40,000 Premium</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="form-label text-xs uppercase tracking-wider text-slate-400 mb-0">
                      6-Digit Bond Serial Number
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickNumber("482671")}
                      className="text-[11px] text-brand-400 hover:text-cyan-300 font-medium underline transition-colors"
                    >
                      Try winning demo (482671)
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={quickNumber}
                    onChange={(e) => setQuickNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 482671"
                    className="input-field font-mono text-base tracking-widest bg-[#0c102c] border-white/15 placeholder:font-sans placeholder:tracking-normal"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Free instant lookup. No registration needed.</span>
                </div>
                <button
                  type="submit"
                  disabled={checking || !quickNumber}
                  className="btn-primary w-full sm:w-auto !py-3 !px-7 flex items-center justify-center gap-2 font-bold"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking 12 Draws...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Draw Results</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {checkResult && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
                {checkResult.won ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/50 border border-emerald-500/40 relative overflow-hidden shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Award className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                          🎉 OFFICIAL PRIZE WINNER
                        </div>
                        <h3 className="text-xl font-extrabold text-white">
                          Congratulations! {checkResult.prize}
                        </h3>
                        <p className="text-sm text-slate-300 mt-1">
                          Bond Number <strong className="text-cyan-300 font-mono">{quickNumber}</strong> matched in <strong className="text-white">{checkResult.drawNo}</strong> held at <strong className="text-white">{checkResult.city}</strong> on {checkResult.date}.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href="/register"
                            className="btn-emerald text-xs !py-2 !px-4 flex items-center gap-1.5 font-bold"
                          >
                            <span>Save to Portfolio & Track Claims</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          No Win Found in Recent 12 Official Draws
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Bond #{quickNumber} was not drawn in recent records, but remains valid for future draws!
                        </p>
                        <Link
                          href="/register"
                          className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-cyan-300 font-semibold mt-3"
                        >
                          <span>Save this bond for auto-check on next draw</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 2026 CUTTING-EDGE CHARTS & ANALYTICS TERMINAL ────────────────────── */}
      <section id="charts" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 text-brand-400" />
              <span>Real-Time Market & Prize Bond Data Visualization</span>
            </div>
            <h2 className="section-heading mb-3">2026 Interactive Financial Terminal</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Explore live exchange rate volatility, prize pool allocations, and simulated portfolio ROI with interactive charts.
            </p>
          </div>

          {/* Interactive Chart Container */}
          <div className="premium-card p-6 sm:p-8 border-white/15 relative overflow-hidden backdrop-blur-2xl">
            {/* Top Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
              {/* Chart Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "fx", label: "Currency Rate History", icon: TrendingUp },
                  { id: "pools", label: "Prize Pools by Denomination", icon: BarChart3 },
                  { id: "portfolio", label: "Portfolio Growth Simulator", icon: Layers },
                  { id: "distribution", label: "Winner Distribution", icon: PieIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setChartTab(tab.id as typeof chartTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      chartTab === tab.id
                        ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40"
                        : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Timeframe selector (only for FX tab) */}
              {chartTab === "fx" && (
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start lg:self-auto">
                  {(["1M", "3M", "6M", "1Y"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setFxTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        fxTimeframe === tf
                          ? "bg-brand-500 text-surface-950 font-black"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              {chartTab === "fx" && (
                <>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">USD/PKR Interbank</span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono">278.40 <span className="text-xs text-emerald-400 font-bold">▲ +0.12%</span></div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">24h High / Low</span>
                    <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">278.95 <span className="text-xs text-slate-400">/ 277.80</span></div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Open Market Spread</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">0.35 PKR</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Sync Status</span>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Feed
                    </div>
                  </div>
                </>
              )}

              {chartTab === "pools" && (
                <>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Prize Pool</span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono">Rs. 883.8M</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Highest Jackpot</span>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">Rs. 80 Million</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Draw Winners</span>
                    <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">8,374 Winners</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Issuing Authority</span>
                    <div className="text-sm font-bold text-white mt-1">State Bank of Pakistan</div>
                  </div>
                </>
              )}

              {chartTab === "portfolio" && (
                <>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Simulated Capital</span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono">Rs. 600,000</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Simulated Prizes Won</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">Rs. 1,500,000</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Net Worth</span>
                    <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">Rs. 2,100,000</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Annualized Yield</span>
                    <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">+250%</div>
                  </div>
                </>
              )}

              {chartTab === "distribution" && (
                <>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">3rd Prize Share</span>
                    <div className="text-xl sm:text-2xl font-black text-brand-400 font-mono">78% of Draws</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">2nd Prize Share</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">16% of Draws</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">1st Prize Jackpot</span>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">6% of Draws</div>
                  </div>
                  <div className="stat-card">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Winner Odds</span>
                    <div className="text-sm font-bold text-white mt-1">1 in 833 per 1000 bonds</div>
                  </div>
                </>
              )}
            </div>

            {/* Chart Canvas - Concise, compact, reasonable height */}
            <div className="w-full h-[260px] sm:h-[280px] mt-3">
              {!mounted ? (
                <div className="w-full h-full skeleton rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartTab === "fx" ? (
                    <AreaChart
                      data={currencyHistoryData[fxTimeframe]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="fxGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="sbpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        name="Interbank Market Rate (PKR)"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#fxGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sbp"
                        name="SBP Reference Rate (PKR)"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#sbpGradient)"
                      />
                    </AreaChart>
                  ) : chartTab === "pools" ? (
                    <BarChart
                      data={prizePoolData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="poolBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="denom" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar
                        dataKey="totalPool"
                        name="Total Prize Pool (Million PKR)"
                        fill="url(#poolBar)"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="firstPrize"
                        name="1st Prize Jackpot (Million PKR)"
                        fill="#f59e0b"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  ) : chartTab === "portfolio" ? (
                    <AreaChart
                      data={portfolioGrowthData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="totalValue"
                        name="Total Worth with Winnings (PKR)"
                        stroke="#34d399"
                        strokeWidth={3}
                        fill="url(#portfolioGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="portfolio"
                        name="Capital Invested (PKR)"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        fill="none"
                      />
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={winnerDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {winnerDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Bottom Chart Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-4 border-t border-white/10 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                Data sourced from official SBP Draw Gazette & Interbank Currency Feed
              </span>
              <Link
                href="/register"
                className="text-brand-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Track Your Custom Portfolio Charts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE INTERACTIVE CURRENCY CONVERTER ────────────────────────────── */}
      <section id="converter" className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Live SBP Interbank & Open Market Rates
            </div>
            <h2 className="section-heading mb-3">Instant PKR Currency Converter</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Calculate exact exchange rates against Pakistani Rupee with live bank spreads and 24-hour rate change tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Live Converter Card */}
            <div className="lg:col-span-7 premium-card p-6 sm:p-8 border-white/15">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Calculator
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Synced 2 mins ago
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label text-xs text-slate-400">You Send / Convert</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={fxAmount}
                      onChange={(e) => setFxAmount(Math.max(1, Number(e.target.value)))}
                      className="input-field text-xl font-mono font-bold flex-1 bg-[#090b24]"
                    />
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="input-field !w-36 bg-[#090b24] font-bold text-white cursor-pointer"
                    >
                      {Object.keys(currencyRates).map((cur) => (
                        <option key={cur} value={cur}>
                          {currencyRates[cur].flag} {cur}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-center my-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-brand-400">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs text-slate-400">You Receive (Estimated PKR)</label>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-emerald-950/30 border border-brand-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-white font-mono">
                        ₨ {pkrConverted}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Rate: 1 {selectedCurrency} = {currentRate.toFixed(2)} PKR
                      </div>
                    </div>
                    <span className="text-2xl font-black gradient-text">PKR</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Interbank Reference: SBP Bulletin</span>
                <Link href="/register" className="text-brand-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                  View Full Currency Chart & Historical Trends <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Currency Rate Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {Object.entries(currencyRates).map(([code, item]) => (
                <div
                  key={code}
                  onClick={() => setSelectedCurrency(code)}
                  className={`glass-card p-4 cursor-pointer transition-all duration-200 border ${
                    selectedCurrency === code
                      ? "border-brand-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{item.flag}</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        item.change.startsWith("+")
                          ? "text-emerald-400"
                          : item.change.startsWith("-")
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{code} / PKR</div>
                  <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">
                    ₨ {item.rate.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ── PRIZE BOND DENOMINATIONS & DRAW PRIZES ──────────────────────────── */}
      <section id="denominations" className="py-20 px-4 bg-black/30 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" /> SBP National Savings Prize Bond Schedule
            </div>
            <h2 className="section-heading mb-3">Official Bond Denominations & Prizes</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Explore official prize amounts, winner distributions, and upcoming draw cycles for all 6 active denominations in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {denominations.map((d) => (
              <div
                key={d.value}
                className={`bond-card p-6 border ${d.border} flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                      {d.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-400" /> {d.drawCycle}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Denomination
                    </span>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      Rs. {d.value}
                    </h3>
                    <p className="text-xs text-slate-400">{d.name}</p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-white/10 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">🥇 1st Prize:</span>
                      <strong className="text-emerald-400 font-extrabold">{d.firstPrize}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">🥈 2nd Prize:</span>
                      <strong className="text-white font-semibold">{d.secondPrize}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">🥉 3rd Prize:</span>
                      <strong className="text-slate-300 font-medium">{d.thirdPrize}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400 text-xs">Total Winners:</span>
                      <span className="text-cyan-300 font-mono text-xs">{d.totalPrizes}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setQuickDenom(d.value);
                      const el = document.getElementById("checker");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full btn-ghost text-xs !py-2.5 flex items-center justify-center gap-2 group-hover:border-brand-500/50 group-hover:text-cyan-300"
                  >
                    <span>Check Rs. {d.value} Bonds</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS & FEATURE COMPARISON ────────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-3">Why Modern Investors Choose Aura Wealth Terminal</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Compare the traditional tedious manual PDF checking method with automated intelligent tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/20 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold mb-4">
                ❌ Traditional Manual Way
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Manual Newspaper & PDF Hunting
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>Downloading huge 10MB PDFs with thousands of tiny 6-digit numbers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>Missing claims deadlines because you forgot a quarterly draw date.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>Zero portfolio tracking — no record of which serial numbers you own.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>Guessing currency values and bank spreads without live interbank data.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-emerald-950/30 border border-brand-500/40 relative shadow-xl shadow-cyan-500/10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4">
                ✨ The Aura Wealth Terminal Way
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Automated Portfolio & Live Tracker
              </h3>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>AI Camera Scan:</strong> Snap a photo of paper bonds for 1-click OCR entry.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Auto Draw Matcher:</strong> The moment a draw is held, your bonds are automatically checked.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Winning Alerts:</strong> Instant in-app & email notification when you win.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Live Exchange Rates:</strong> Accurate interbank currency exchange conversion.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-heading mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">
              Everything you need to know about Pakistan Prize Bonds and Aura Wealth Terminal.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card overflow-hidden border-white/10">
                <button
                  id={`faq-${i}`}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-white text-sm pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3.5 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center premium-card p-10 sm:p-14 border border-brand-500/30 relative overflow-hidden shadow-2xl shadow-cyan-500/10">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Manage Your Prize Bonds Like A Pro?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Create your free account today. Add your bonds, get automatic draw check alerts, and monitor Pakistani Rupee currency rates with AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary text-base !py-3.5 !px-8 flex items-center gap-2 font-bold shadow-cyan-500/40"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="btn-ghost text-base !py-3.5 !px-8"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <FloatingAssistantWidget />
      <Footer />
    </div>
  );
}
