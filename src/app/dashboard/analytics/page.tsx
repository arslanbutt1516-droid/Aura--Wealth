"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { BarChart2, TrendingUp, Trophy, Info, RefreshCw } from "lucide-react";

interface AnalyticsData {
  bonds: {
    total: number; active: number; totalValue: number;
    winners: number; totalWinnings: number;
    byDenomination: { denomination: number; count: number; value: number }[];
    byStatus: { active: number; sold: number; lost: number; expired: number };
    winningHistory: { bondNumber: string; denomination: number; prizeAmount: number; drawDate: string }[];
    monthlyActivity: { month: string; bonds: number; checks: number }[];
  };
  currency: { pkrPerUsd: number | null; lastUpdated: string | null; source: string | null; isCached: boolean };
  hasData: boolean;
}

const COLORS = ["#06b6d4", "#818cf8", "#22c55e", "#f59e0b", "#ec4899", "#f97316"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-medium">{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">Financial Analytics</h1>
        <div className="premium-card p-16 text-center">
          <BarChart2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">Not enough data yet.</p>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Add prize bonds to your portfolio, check them, and convert currencies to start building your analytics dashboard.
          </p>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "Active", value: data.bonds.byStatus.active },
    { name: "Sold", value: data.bonds.byStatus.sold },
    { name: "Lost", value: data.bonds.byStatus.lost },
    { name: "Expired", value: data.bonds.byStatus.expired },
  ].filter(d => d.value > 0);

  const denomData = data.bonds.byDenomination.map(d => ({
    name: `Rs. ${d.denomination.toLocaleString()}`,
    count: d.count,
    value: d.value,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Real data from your portfolio and account activity.</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bonds", value: data.bonds.total, sub: `${data.bonds.active} active` },
          { label: "Portfolio Value", value: `Rs. ${data.bonds.totalValue.toLocaleString()}`, sub: "Combined denomination" },
          { label: "Winning Bonds", value: data.bonds.winners, sub: "Verified winners" },
          { label: "Total Winnings", value: `Rs. ${data.bonds.totalWinnings.toLocaleString()}`, sub: "Verified prizes" },
        ].map(s => (
          <div key={s.label} className="premium-card p-5">
            <p className="text-2xl font-bold gradient-text mb-1">{s.value}</p>
            <p className="text-sm font-medium text-slate-300">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Denomination Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5">Portfolio by Denomination</h2>
          {denomData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-500 text-sm">No bond data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={denomData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bond Status Pie Chart */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5">Bond Status Distribution</h2>
          {statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-500 text-sm">No bond data</p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {statusData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-300">{item.name}</span>
                    <span className="ml-auto text-xs font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Activity Chart */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5">Monthly Activity (Last 6 Months)</h2>
          {data.bonds.monthlyActivity.every(m => m.bonds === 0 && m.checks === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <Info className="w-6 h-6 text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">No activity data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.bonds.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{v}</span>} />
                <Bar dataKey="bonds" name="Bonds Added" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checks" name="Checks" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Winning History */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Winning History
          </h2>
          {data.bonds.winningHistory.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <Trophy className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No winning bonds yet.</p>
              <p className="text-slate-500 text-xs mt-1">
                Check your bonds to see if any have won prizes.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.bonds.winningHistory.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white font-mono">{w.bondNumber}</p>
                    <p className="text-xs text-slate-400">Rs. {w.denomination.toLocaleString()} · {w.drawDate ? new Date(w.drawDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">
                    Rs. {w.prizeAmount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="disclaimer">
        <strong>Note:</strong> Analytics are calculated from your MongoDB portfolio data and verified draw results. Currency rates are fetched from external APIs. All financial data should be verified with authoritative sources.
      </div>
    </div>
  );
}
