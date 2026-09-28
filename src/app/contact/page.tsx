"use client";

import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#060714] text-white flex flex-col font-sans selection:bg-brand-500/30">
      <PublicNav />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Have questions, feedback, or need support? Our team is here to help you get the most out of Aura Wealth Terminal.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="premium-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Email Support</h3>
                  <p className="text-xs text-slate-400 mb-2">We aim to respond within 24 hours.</p>
                  <a href="mailto:support@aurawealthterminal.com" className="text-sm font-medium text-brand-400 hover:text-brand-300">support@aurawealthterminal.com</a>
                </div>
              </div>

              <div className="premium-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Phone / WhatsApp</h3>
                  <p className="text-xs text-slate-400 mb-2">Mon-Fri, 9am - 6pm PKT</p>
                  <a href="https://wa.me/923001234567" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">+92 300 123 4567</a>
                </div>
              </div>

              <div className="premium-card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Headquarters</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Aura Wealth AI Inc.<br />
                    123 Innovation Drive, Tech Park<br />
                    Lahore, Pakistan 54000
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <form className="premium-card p-8" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                <h2 className="text-xl font-bold mb-6">Send us a Message</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <input type="text" className="input-field" placeholder="John" required />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="input-field" placeholder="Doe" required />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="input-field" placeholder="john@example.com" required />
                </div>

                <div className="mb-4">
                  <label className="form-label">Subject</label>
                  <select className="input-field">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Feature Request</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="form-label">Message</label>
                  <textarea className="input-field min-h-[120px] resize-y" placeholder="How can we help you?" required></textarea>
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
