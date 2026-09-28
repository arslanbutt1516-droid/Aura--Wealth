"use client";

import React, { useState } from "react";
import {
  Zap, Check, X, ShieldCheck, Award, Sparkles,
  ArrowRight, FileSpreadsheet, Bell, Bot, TrendingUp
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProUpgradeModal({ isOpen, onClose }: ProUpgradeModalProps) {
  const { isPro, activatePro, t, language } = useApp();
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    activatePro();
    setActivated(true);
    setTimeout(() => {
      onClose();
      setActivated(false);
    }, 1500);
  };

  const proPerks = [
    {
      icon: Zap,
      title: language === "ur" ? "لامحدود پرائز بانڈز محفوظ کریں" : "Unlimited Prize Bonds Tracking",
      desc: language === "ur" ? "ایک ساتھ 50,000 بانڈز محفوظ کریں، ایکسل اور رینج امپورٹ کے ساتھ" : "Track up to 50,000 bonds with 1-click Excel/CSV bulk import",
      badge: "Unlimited",
    },
    {
      icon: Bell,
      title: language === "ur" ? "فوری واٹس ایپ اور ایس ایم ایس ونر الرٹس" : "Instant WhatsApp & SMS Win Alerts",
      desc: language === "ur" ? "جیسے ہی قرعہ اندازی ہو، آپ کو واٹس ایپ پر فورا پیغام ملے گا" : "Instant notifications delivered to your WhatsApp, SMS & Email",
      badge: "Real-time",
    },
    {
      icon: FileSpreadsheet,
      title: language === "ur" ? "اسٹیٹ بینک سرکاری گزٹ تصدیق" : "Official SBP Gazette Auto-Check",
      desc: language === "ur" ? "قرعہ اندازی کے 60 سیکنڈز میں تمام 12 سال کا ڈیٹا فوری چیک کریں" : "Synchronized with official State Bank draw gazette within 60s",
      badge: "Fastest",
    },
    {
      icon: Bot,
      title: language === "ur" ? "اے آئی انعامی امکانات اور تاریخ" : "AI Mathematical Odds Matrix",
      desc: language === "ur" ? "ماضی کے 10 سالہ ڈیٹا کی بنیاد پر جیتنے کے امکانات کا ریاضیاتی حساب" : "Deep historical winning pattern probability analysis and prediction",
      badge: "AI Powered",
    },
    {
      icon: Award,
      title: language === "ur" ? "ایف بی آر ٹیکس سیونگز اور کلیم پیپرز" : "FBR Tax Optimization & Claim Forms",
      desc: language === "ur" ? "انعام کی وصولی کے لیے سرکاری فارم اور ٹیکس کی کٹوتی کی تفصیلی رپورٹ" : "Automated prize claim paperwork and 15% filer withholding tax savings",
      badge: "Legal Ready",
    },
    {
      icon: TrendingUp,
      title: language === "ur" ? "ریئل ٹائم لائیو کرنسی ریٹ لاک الرٹ" : "Live Currency Rate Lock Alerts",
      desc: language === "ur" ? "اوورسیز پاکستانیوں کے لیے مثالی شرح مبادلہ پر فوری ایس ایم ایس الرٹ" : "Target exchange rate triggers for overseas remittances",
      badge: "Global",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#080d24] border border-sky-500/30 p-6 sm:p-8 shadow-2xl shadow-sky-500/20 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Aura Wealth Terminal VIP Pro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === "ur" ? "وی آئی پی پرو کی تمام خصوصیات انلاک کریں" : "Unlock Complete VIP Pro Power"}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
            {language === "ur"
              ? "پاکستان کے تمام پرائز بانڈز اور لائیو کرنسی کے لیے جدید ترین ٹولز"
              : "Advanced institutional-grade tools built for serious Pakistan prize bond and currency investors."}
          </p>
        </div>

        {/* Grid of Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {proPerks.map((perk, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/8 hover:border-sky-500/30 transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                <perk.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-white truncate">{perk.title}</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {perk.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing / Activation Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-sky-950/40 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">Rs. 0</span>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                {language === "ur" ? "مفت وی آئی پی ٹرائل" : "Free VIP Trial Active"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "ur" ? "کوئی کارڈ درکار نہیں • فوری ایکٹیویشن" : "No credit card required • Instant 1-click activation"}
            </p>
          </div>

          <button
            onClick={handleActivate}
            disabled={activated || isPro}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
              activated || isPro
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/30 hover:scale-105 active:scale-95"
            }`}
          >
            {activated || isPro ? (
              <>
                <Check className="w-4 h-4" />
                <span>{language === "ur" ? "وی آئی پی پرو فعال ہوگیا!" : "VIP Pro Active!"}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{language === "ur" ? "مفت وی آئی پی پرو ابھی انلاک کریں" : "Unlock VIP Pro Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
