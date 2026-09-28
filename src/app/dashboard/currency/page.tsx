"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeftRight, RefreshCw, Bell, BellOff, Trash2, Plus,
  TrendingUp, TrendingDown, AlertCircle, Info,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const CURRENCIES = [
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "QAR", name: "Qatari Riyal", flag: "🇶🇦" },
];

interface RatesData {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
  source: string;
  isCached: boolean;
}

interface HistoryPoint { date: string; rate: number }
interface HistoryData {
  base: string; target: string; days: number;
  history: HistoryPoint[];
  stats: { current: number; previous: number; highest: number; lowest: number; change: number; changeDirection: string } | null;
  message?: string;
}

interface Alert {
  id: string; baseCurrency: string; targetCurrency: string;
  targetRate: number; direction: "above" | "below";
  enabled: boolean; triggered: boolean; createdAt: string;
}

export default function CurrencyPage() {
  const [rates, setRates] = useState<RatesData | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  // Converter
  const [amount, setAmount] = useState("1");
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("PKR");
  const [converted, setConverted] = useState<number | null>(null);
  const [convRate, setConvRate] = useState<number | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  // History
  const [histDays, setHistDays] = useState(30);
  const [histData, setHistData] = useState<HistoryData | null>(null);
  const [histLoading, setHistLoading] = useState(false);

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ baseCurrency: "USD", targetCurrency: "PKR", targetRate: "", direction: "above" as "above" | "below" });
  const [alertLoading, setAlertLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await fetch(`/api/currency/history?base=${fromCur}&target=${toCur}&days=${histDays}`);
      const json = await res.json();
      if (json.success) setHistData(json.data);
    } catch { }
    finally { setHistLoading(false); }
  }, [fromCur, toCur, histDays]);

  const loadRates = async () => {
    setRatesLoading(true);
    try {
      const res = await fetch("/api/currency/rates?base=USD");
      const json = await res.json();
      if (json.success) setRates(json.data);
    } catch { }
    finally { setRatesLoading(false); }
  };

  useEffect(() => { loadRates(); loadAlerts(); }, []);
  useEffect(() => { if (rates) loadHistory(); }, [rates, loadHistory]);

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/currency/alerts");
      const json = await res.json();
      if (json.success) setAlerts(json.data);
    } catch { }
  };

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    setConvLoading(true);
    try {
      const res = await fetch("/api/currency/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, from: fromCur, to: toCur }),
      });
      const json = await res.json();
      if (json.success) { setConverted(json.data.convertedAmount); setConvRate(json.data.rate); }
    } catch { }
    finally { setConvLoading(false); }
  };

  const swap = () => { setFromCur(toCur); setToCur(fromCur); setConverted(null); };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertLoading(true);
    try {
      const res = await fetch("/api/currency/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...alertForm, targetRate: parseFloat(alertForm.targetRate) }),
      });
      const json = await res.json();
      if (json.success) { setAlerts(p => [json.data, ...p]); setShowAlertForm(false); setAlertForm({ baseCurrency: "USD", targetCurrency: "PKR", targetRate: "", direction: "above" }); }
    } catch { }
    finally { setAlertLoading(false); }
  };

  const handleDeleteAlert = async (id: string) => {
    await fetch(`/api/currency/alerts/${id}`, { method: "DELETE" });
    setAlerts(p => p.filter(a => a.id !== id));
  };

  const getRate = (from: string, to: string) => {
    if (!rates?.rates) return null;
    const fromRate = rates.rates[from] || (from === "USD" ? 1 : null);
    const toRate = rates.rates[to];
    if (!fromRate || !toRate) return null;
    return toRate / fromRate;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Currency Exchange</h1>
        <p className="text-slate-400 text-sm mt-1">
          {rates?.isCached ? (
            <span className="text-amber-400">⚠ Cached — last updated {new Date(rates.timestamp).toLocaleString()}</span>
          ) : rates ? (
            <span className="text-emerald-400">✓ Live rates — updated {new Date(rates.timestamp).toLocaleString()}</span>
          ) : "Loading rates…"}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Converter ── */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5">Currency Converter</h2>
          {!rates && ratesLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 skeleton rounded-xl"/>)}</div>
          ) : !rates?.rates || Object.keys(rates.rates).length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-300 font-medium mb-1">Currency API Not Configured</p>
              <p className="text-slate-500 text-xs">Add CURRENCY_API_KEY to .env.local to enable live rates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="form-label">Amount</label>
                <input
                  id="conv-amount"
                  type="number"
                  min="0"
                  step="any"
                  className="input-field text-lg font-semibold"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setConverted(null); }}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="form-label">From</label>
                  <select id="conv-from" className="input-field" value={fromCur} onChange={(e) => { setFromCur(e.target.value); setConverted(null); }}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-surface-900">{c.flag} {c.code} — {c.name}</option>)}
                  </select>
                </div>
                <button onClick={swap} className="mt-6 p-2.5 rounded-xl border border-white/15 text-slate-400 hover:text-white hover:border-brand-500/30 hover:bg-white/5 transition-all" aria-label="Swap currencies">
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <label className="form-label">To</label>
                  <select id="conv-to" className="input-field" value={toCur} onChange={(e) => { setToCur(e.target.value); setConverted(null); }}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-surface-900">{c.flag} {c.code} — {c.name}</option>)}
                  </select>
                </div>
              </div>
              <button id="convert-btn" onClick={handleConvert} disabled={convLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {convLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                {convLoading ? "Converting…" : "Convert"}
              </button>

              {converted !== null && (
                <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{amount} {fromCur} =</p>
                  <p className="text-3xl font-bold gradient-text">
                    {converted.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCur}
                  </p>
                  {convRate && (
                    <p className="text-xs text-slate-400 mt-2">
                      1 {fromCur} = {convRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCur}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Source: {rates?.source}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Live Rates ── */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Live Rates (vs USD)</h2>
            <button onClick={loadRates} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all" aria-label="Refresh rates">
              <RefreshCw className={`w-4 h-4 ${ratesLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {ratesLoading ? (
            <div className="space-y-2">{CURRENCIES.map(c => <div key={c.code} className="h-10 skeleton rounded-lg"/>)}</div>
          ) : !rates?.rates || Object.keys(rates.rates).length === 0 ? (
            <div className="text-center py-8">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Configure CURRENCY_API_KEY for live rates.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {CURRENCIES.filter(c => c.code !== "USD").map(c => {
                const rate = rates.rates[c.code];
                return rate ? (
                  <div key={c.code} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <span className="text-sm font-medium text-white">{c.code}</span>
                      <span className="text-xs text-slate-500 hidden sm:block">{c.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200 font-mono">
                      {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Historical Chart ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <h2 className="font-semibold text-white">
            Historical Rate: {fromCur}/{toCur}
          </h2>
          <div className="flex gap-2">
            {[7, 30, 90, 180, 365].map(d => (
              <button
                key={d}
                onClick={() => setHistDays(d)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${histDays === d ? "border-brand-500/50 bg-brand-500/10 text-brand-400" : "border-white/10 text-slate-400 hover:border-white/20"}`}
              >
                {d === 365 ? "1Y" : d === 180 ? "6M" : d === 90 ? "3M" : `${d}D`}
              </button>
            ))}
          </div>
        </div>

        {histData?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Current", value: histData.stats.current?.toFixed(4) },
              { label: "Previous", value: histData.stats.previous?.toFixed(4) },
              { label: "Highest", value: histData.stats.highest?.toFixed(4) },
              { label: "Lowest", value: histData.stats.lowest?.toFixed(4) },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {histLoading ? (
          <div className="h-48 skeleton rounded-xl" />
        ) : histData?.history && histData.history.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={histData.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: "#0d0f2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm">{histData?.message || "No historical data yet."}</p>
            <p className="text-slate-500 text-xs mt-1">
              Historical data builds up as rates are fetched daily.
            </p>
          </div>
        )}
      </div>

      {/* ── Currency Alerts ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Currency Alerts</h2>
          <button id="create-alert-btn" onClick={() => setShowAlertForm(!showAlertForm)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Alert
          </button>
        </div>

        {showAlertForm && (
          <form onSubmit={handleCreateAlert} className="mb-5 p-4 bg-white/5 rounded-xl space-y-3 border border-white/10">
            <p className="text-sm font-medium text-white">New Rate Alert</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Base Currency</label>
                <select className="input-field text-sm" value={alertForm.baseCurrency} onChange={e => setAlertForm(p => ({ ...p, baseCurrency: e.target.value }))}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-surface-900">{c.flag} {c.code}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Target Currency</label>
                <select className="input-field text-sm" value={alertForm.targetCurrency} onChange={e => setAlertForm(p => ({ ...p, targetCurrency: e.target.value }))}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-surface-900">{c.flag} {c.code}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Target Rate</label>
                <input type="number" step="any" className="input-field text-sm" placeholder="e.g. 300" value={alertForm.targetRate} onChange={e => setAlertForm(p => ({ ...p, targetRate: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Direction</label>
                <select className="input-field text-sm" value={alertForm.direction} onChange={e => setAlertForm(p => ({ ...p, direction: e.target.value as "above" | "below" }))}>
                  <option value="above" className="bg-surface-900">Goes Above</option>
                  <option value="below" className="bg-surface-900">Goes Below</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAlertForm(false)} className="btn-ghost text-sm flex-1">Cancel</button>
              <button type="submit" disabled={alertLoading} className="btn-primary text-sm flex-1 disabled:opacity-60">
                {alertLoading ? "Creating…" : "Create Alert"}
              </button>
            </div>
          </form>
        )}

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No currency alerts yet.</p>
            <p className="text-slate-500 text-xs mt-1">Create an alert to be notified when a rate hits your target.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border ${alert.triggered ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/8 bg-white/3"}`}>
                <div>
                  <p className="text-sm font-medium text-white">
                    {alert.baseCurrency}/{alert.targetCurrency}{" "}
                    <span className="text-slate-400">{alert.direction}</span>{" "}
                    <span className="gradient-text">{alert.targetRate}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Created {new Date(alert.createdAt).toLocaleDateString()}
                    {alert.triggered && <span className="text-emerald-400 ml-2">✓ Triggered</span>}
                  </p>
                </div>
                <button onClick={() => handleDeleteAlert(alert.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all" aria-label="Delete alert">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
