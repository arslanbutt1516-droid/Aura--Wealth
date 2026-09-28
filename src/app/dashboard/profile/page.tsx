"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Save, CheckCircle } from "lucide-react";

interface UserProfile {
  id: string; name: string; email: string; phone: string;
  whatsappNumber: string; preferredCurrency: string;
  favoriteCurrencies: string[]; notificationPreferences: Record<string, boolean>;
  role: string; createdAt: string;
}

const CURRENCIES = ["PKR", "USD", "EUR", "GBP", "AED", "SAR", "CAD", "AUD"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", whatsappNumber: "", preferredCurrency: "PKR" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setForm({
          name: json.data.name, phone: json.data.phone,
          whatsappNumber: json.data.whatsappNumber,
          preferredCurrency: json.data.preferredCurrency,
        });
      }
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setSuccess("Profile updated successfully!"); setProfile(p => p ? { ...p, ...form } : p); }
      else setError(json.error || "Failed to update profile.");
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-6 max-w-2xl">
      <div className="h-8 w-40 skeleton rounded-lg" />
      <div className="h-64 skeleton rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information.</p>
      </div>

      {/* Avatar */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{profile?.name}</p>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 capitalize">
                {profile?.role}
              </span>
              <span className="text-xs text-slate-500">
                Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="premium-card p-6">
        <h2 className="font-semibold text-white mb-5">Edit Profile</h2>

        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-4" id="profile-form">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input id="profile-name" type="text" className="input-field pl-10" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="form-label">Email Address (cannot change)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" className="input-field pl-10 opacity-50 cursor-not-allowed" value={profile?.email || ""} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="profile-phone" type="tel" className="input-field pl-10" placeholder="03001234567" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="form-label">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="profile-whatsapp" type="tel" className="input-field pl-10" placeholder="03001234567" value={form.whatsappNumber}
                  onChange={e => setForm(p => ({ ...p, whatsappNumber: e.target.value }))} />
              </div>
            </div>
          </div>
          <div>
            <label className="form-label">Preferred Currency</label>
            <select id="profile-currency" className="input-field" value={form.preferredCurrency}
              onChange={e => setForm(p => ({ ...p, preferredCurrency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c} value={c} className="bg-surface-900">{c}</option>)}
            </select>
          </div>
          <button id="save-profile-btn" type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
