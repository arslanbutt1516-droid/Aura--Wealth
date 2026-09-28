"use client";

import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import { AlertTriangle, Send } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#060714] text-white flex flex-col font-sans selection:bg-brand-500/30">
      <PublicNav />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Report an Issue
            </h1>
            <p className="text-slate-400">
              Found a bug, incorrect data, or experiencing issues? Let us know so we can fix it immediately.
            </p>
          </div>

          <form className="premium-card p-8 animate-fade-in-up" style={{ animationDelay: "100ms" }} onSubmit={(e) => { e.preventDefault(); alert("Report submitted successfully. Thank you for helping us improve!"); }}>
            
            <div className="mb-5">
              <label className="form-label">Issue Type</label>
              <select className="input-field" required>
                <option value="">Select an issue type...</option>
                <option value="bug">Platform Bug / Glitch</option>
                <option value="data">Incorrect Draw Results</option>
                <option value="scan">AI Scanner Issue</option>
                <option value="security">Security Concern</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="form-label">Severity</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-surface-900 cursor-pointer hover:border-brand-500/50 transition-colors">
                  <input type="radio" name="severity" value="low" className="text-brand-500" />
                  <span className="text-sm">Low</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-surface-900 cursor-pointer hover:border-amber-500/50 transition-colors">
                  <input type="radio" name="severity" value="medium" className="text-amber-500" />
                  <span className="text-sm">Medium</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-surface-900 cursor-pointer hover:border-red-500/50 transition-colors">
                  <input type="radio" name="severity" value="high" className="text-red-500" required />
                  <span className="text-sm">High</span>
                </label>
              </div>
            </div>

            <div className="mb-5">
              <label className="form-label">Description</label>
              <textarea 
                className="input-field min-h-[150px] resize-y" 
                placeholder="Please describe the issue in detail. Steps to reproduce the problem are highly appreciated." 
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="form-label">Attachments (Optional)</label>
              <input type="file" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-surface-900 file:text-white hover:file:bg-surface-800 transition-all cursor-pointer border border-white/10 rounded-xl" />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
              Submit Report <Send className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-500 mt-6">
              If this is regarding a specific account issue, please use the <Link href="/contact" className="text-brand-400 hover:underline">Contact form</Link> instead.
            </p>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
