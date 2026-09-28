"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight, Sun, Moon, Globe } from "lucide-react";
import AuraLogo from "./AuraLogo";
import { useApp } from "@/context/AppContext";

// ── Ticker data ──────────────────────────────────────────────────────────────
const tickerItems = [
  { label: "Prize Bond Rs.100", value: "Draw #97", change: "Latest" },
  { label: "Prize Bond Rs.200", value: "Draw #93", change: "Latest" },
  { label: "Prize Bond Rs.750", value: "Draw #97", change: "Latest" },
  { label: "Prize Bond Rs.1500", value: "Draw #96", change: "Latest" },
  { label: "Prize Bond Rs.7500", value: "Draw #93", change: "Latest" },
  { label: "Prize Bond Rs.15000", value: "Draw #89", change: "Latest" },
  { label: "Prize Bond Rs.25000", value: "Draw #42", change: "Latest" },
  { label: "USD/PKR", value: "278.50", change: "+0.12%" },
  { label: "EUR/PKR", value: "301.20", change: "-0.08%" },
  { label: "GBP/PKR", value: "355.80", change: "+0.21%" },
  { label: "SAR/PKR", value: "74.15", change: "+0.05%" },
];

function TickerItem({ label, value, change }: { label: string; value: string; change: string }) {
  const isPositive = change.startsWith("+") || change === "Latest";
  return (
    <span className="flex items-center gap-2 px-6 whitespace-nowrap text-[11px]">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-white font-bold">{value}</span>
      <span className={isPositive ? "text-emerald-400" : "text-red-400"}>{change}</span>
      <span className="text-white/10">|</span>
    </span>
  );
}

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme, language, toggleLanguage, t } = useApp();

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/report", label: "Report" },
    { href: "#checker", label: t("checker") },
    { href: "#converter", label: t("currencyRates") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#060714]/80 backdrop-blur-2xl transition-colors duration-300">
      {/* ── Continuous Scrolling Ticker ──────────────────────────────────── */}
      <div className="border-b border-white/[0.06] bg-black/30 overflow-hidden relative h-8 flex items-center">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#060714] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#060714] to-transparent z-10 pointer-events-none" />

        {/* Live dot + label (pinned left) */}
        <div className="absolute left-4 z-20 flex items-center gap-1.5 pr-3 border-r border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-80" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap">
            Live
          </span>
        </div>

        {/* Scrolling track — items are doubled for seamless loop */}
        <div
          className="flex animate-ticker ml-24"
          style={{ willChange: "transform" }}
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-[1px] shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all duration-300">
              <div className="w-full h-full bg-surface-950 rounded-[11px] flex items-center justify-center">
                <AuraLogo className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-white text-xl tracking-tight leading-none flex items-center gap-1.5">
                Aura Wealth Terminal <span className="gradient-text font-black">AI</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block mt-1">
                {language === "ur" ? "پاکستان پرائز بانڈز اور لائیو کرنسی" : "Pakistan Prize Bonds & Live Currency"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/8 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/8 rounded-full transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Controls (Mood / Language / CTA) */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Night / Day Mood Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-medium"
              title={theme === "night" ? "Switch to Day Mode" : "Switch to Night Mode"}
              aria-label="Toggle Night/Day mood"
            >
              {theme === "night" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">{t("dayMode")}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span className="hidden xl:inline text-[11px]">{t("nightMode")}</span>
                </>
              )}
            </button>

            {/* Language / Translator Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Change Language / زبان تبدیل کریں"
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[11px]">{language === "en" ? "اردو" : "English"}</span>
            </button>

            {/* WhatsApp Mini Button */}
            <a
              href="https://wa.me/923001234567?text=Hello%20Aura%20Wealth%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all"
              title="Chat on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.073-2.027-.477-1.427-.589-2.348-2.039-2.42-2.133-.071-.095-.572-.763-.572-1.455 0-.693.361-1.033.49-1.176.129-.144.281-.18.375-.18.095 0 .19.001.272.006.088.005.205-.033.32.245.12.289.408 1.002.444 1.075.036.073.06.158.01.256-.049.098-.073.159-.146.244-.073.085-.154.19-.22.256-.073.072-.15.15-.064.298.086.148.382.631.821 1.022.564.502 1.04.658 1.188.732.148.073.235.061.323-.037.087-.098.375-.438.475-.589.1-.151.2-.126.334-.076.134.049.851.401.997.474.146.073.244.11.28.171.036.061.036.356-.108.761zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.177L2 22l4.981-1.397A9.946 9.946 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>{t("whatsapp")}</span>
            </a>

            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              {t("signIn")}
            </Link>

            {/* Launch App Button */}
            <Link
              href="/dashboard"
              className="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-1.5 shadow-cyan-500/25"
            >
              <span>{t("launchApp")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#060714]/95 backdrop-blur-2xl px-6 py-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 px-4 rounded-xl text-slate-200 hover:text-white hover:bg-white/8 font-medium text-sm transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
            <Link href="/login" className="btn-ghost text-sm text-center !py-3">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm text-center !py-3">
              Launch App Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
