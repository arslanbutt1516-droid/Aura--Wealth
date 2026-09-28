"use client";

import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import { Shield, Target, Users, Zap, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060714] text-white flex flex-col font-sans selection:bg-brand-500/30">
      <PublicNav />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              About <span className="gradient-text">Aura Wealth AI</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              We are revolutionizing how Pakistan tracks and manages Prize Bonds. 
              By leveraging cutting-edge Artificial Intelligence, we provide instant, accurate, 
              and secure financial tools for the modern investor.
            </p>
          </div>

          {/* Mission Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            <div className="premium-card p-8 md:p-10 flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                To democratize access to financial tracking tools in Pakistan. We believe checking your investments shouldn&apos;t require manual effort or unreliable sources. Our AI-driven platform ensures you never miss a winning draw again.
              </p>
              <ul className="space-y-3">
                {["100% Automated Checking", "Bank-Grade Security", "Real-time Currency Updates"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                    <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="premium-card p-8 md:p-10 flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Built by a team of passionate developers and financial experts, Aura Wealth Terminal combines the reliability of official State Bank data with the convenience of modern software.
              </p>
              <ul className="space-y-3">
                {["Advanced AI Bond Scanner", "Instant Draw Notifications", "Comprehensive Analytics Dashboard"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {[
              { label: "Active Users", value: "50K+" },
              { label: "Bonds Scanned", value: "2.1M+" },
              { label: "Prizes Found", value: "Rs. 450M" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-fade-in-up" style={{ animationDelay: `${300 + (i * 100)}ms` }}>
                <div className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-brand-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Team/Info Section */}
          <div className="text-center max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-900 border border-white/10 mb-6">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join the Future of Finance</h2>
            <p className="text-slate-400 mb-8">
              Experience the fastest, most reliable way to track your prize bonds and currency rates. 
              Sign up today and let our AI do the heavy lifting.
            </p>
            <Link href="/register" className="btn-primary px-8 py-4 rounded-xl font-bold text-sm inline-flex items-center gap-2 hover:scale-105 transition-transform">
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
