"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Wallet, TrendingUp, Trophy, DollarSign, Calendar, Zap,
  Camera, PlusCircle, Search, RefreshCw, Bot, BarChart2,
  Bell, Activity, ArrowRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface DashboardData {
  user: { name: string; email: string; preferredCurrency: string };
  bondSummary: {
    totalBonds: number;
    totalBondValue: number;
    winningBonds: number;
    totalWinnings: number;
    bondsByDenomination: Record<number, number>;
    lastChecked: string | null;
  };
  currencyOverview: {
    pkrPerUsd: number | null;
    lastUpdated: string | null;
    source: string | null;
    isCached: boolean;
  };
  upcomingDraw: {
    denomination: number;
    drawNumber: string;
    drawDate: string;
    location: string;
  } | null;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
  unreadNotifications: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "cyan",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500 to-cyan-600",
    emerald: "from-emerald-500 to-emerald-600",
    violet: "from-violet-500 to-violet-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="premium-card p-5 hover:border-white/20 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="premium-card p-5">
      <div className="w-10 h-10 rounded-xl skeleton mb-3" />
      <div className="h-7 w-20 skeleton mb-2" />
      <div className="h-3 w-28 skeleton" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load dashboard.");
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const quickActions = [
    { icon: Camera, label: "Scan Bond", href: "/dashboard/bonds?scan=1", color: "from-violet-500 to-violet-600" },
    { icon: PlusCircle, label: "Add Bond", href: "/dashboard/bonds?add=1", color: "from-cyan-500 to-cyan-600" },
    { icon: Search, label: "Check Bond", href: "/dashboard/bonds?check=1", color: "from-emerald-500 to-emerald-600" },
    { icon: TrendingUp, label: "Currency", href: "/dashboard/currency", color: "from-amber-500 to-amber-600" },
    { icon: Bot, label: "Ask AI", href: "/dashboard/assistant", color: "from-indigo-500 to-indigo-600" },
    { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics", color: "from-pink-500 to-pink-600" },
  ];

  const activityIcons: Record<string, React.ElementType> = {
    account_created: Zap,
    login: Activity,
    bond_added: PlusCircle,
    bond_checked: Search,
    bond_scanned: Camera,
    bond_edited: RefreshCw,
    bond_deleted: Wallet,
    currency_converted: TrendingUp,
    ai_question: Bot,
    notification_sent: Bell,
    profile_updated: RefreshCw,
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 font-medium mb-2">{error}</p>
        <button onClick={loadDashboard} className="btn-ghost text-sm">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back,{" "}
            <span className="gradient-text">
              {loading ? "…" : data?.user?.name?.split(" ")[0] || "User"}
            </span>{" "}
            👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here&apos;s your financial overview for today.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={Wallet}
              label="My Bonds"
              value={data?.bondSummary.totalBonds ?? 0}
              sub="Active bonds"
              color="cyan"
            />
            <StatCard
              icon={DollarSign}
              label="Total Bond Value"
              value={`Rs. ${(data?.bondSummary.totalBondValue ?? 0).toLocaleString()}`}
              sub="Portfolio value"
              color="indigo"
            />
            <StatCard
              icon={Trophy}
              label="Winning Bonds"
              value={data?.bondSummary.winningBonds ?? 0}
              sub="Verified winners"
              color="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Winnings"
              value={`Rs. ${(data?.bondSummary.totalWinnings ?? 0).toLocaleString()}`}
              sub="Verified prizes"
              color="amber"
            />
            <StatCard
              icon={DollarSign}
              label="USD / PKR"
              value={
                data?.currencyOverview.pkrPerUsd
                  ? data.currencyOverview.pkrPerUsd.toFixed(2)
                  : "N/A"
              }
              sub={data?.currencyOverview.isCached ? "Cached rate" : "Live rate"}
              color="rose"
            />
            <StatCard
              icon={Calendar}
              label="Next Draw"
              value={
                data?.upcomingDraw
                  ? `Rs. ${data.upcomingDraw.denomination.toLocaleString()}`
                  : "No data"
              }
              sub={
                data?.upcomingDraw
                  ? new Date(data.upcomingDraw.drawDate).toLocaleDateString()
                  : "Check draws"
              }
              color="violet"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              id={`quick-action-${action.label.toLowerCase().replace(" ", "-")}`}
              className="premium-card p-4 flex flex-col items-center gap-2.5 hover:border-white/20 transition-all duration-200 group text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md`}
              >
                <action.icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bond Overview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Prize Bond Portfolio</h2>
            <Link
              href="/dashboard/bonds"
              className="text-xs text-brand-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 skeleton rounded-xl" />
              ))}
            </div>
          ) : data?.bondSummary.totalBonds === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium mb-1">No prize bonds added yet.</p>
              <p className="text-slate-500 text-xs mb-4">
                Add your first bond to start tracking.
              </p>
              <Link href="/dashboard/bonds?add=1" className="btn-primary text-sm">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Add Your First Bond
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(data?.bondSummary.bondsByDenomination || {}).map(
                ([denom, count]) => (
                  <div
                    key={denom}
                    className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">
                        Rs. {parseInt(denom).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Value: Rs.{" "}
                        {(parseInt(denom) * (count as number)).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold gradient-text">{count as number}</p>
                      <p className="text-xs text-slate-500">bonds</p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-2.5 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentActivity.slice(0, 6).map((activity) => {
                const Icon = activityIcons[activity.type] || Activity;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">
              Notifications{" "}
              {!loading && data?.unreadNotifications
                ? `(${data.unreadNotifications} unread)`
                : ""}
            </h2>
            <Link
              href="/dashboard/notifications"
              className="text-xs text-brand-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : data?.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data?.notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.isRead
                      ? "bg-white/3 border-white/5"
                      : "bg-brand-500/5 border-brand-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currency Overview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Currency Overview</h2>
            <Link
              href="/dashboard/currency"
              className="text-xs text-brand-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Converter <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 skeleton rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm font-medium text-white">USD / PKR</span>
                </div>
                <span className="text-sm font-bold gradient-text">
                  {data?.currencyOverview.pkrPerUsd?.toFixed(2) ?? "N/A"}
                </span>
              </div>

              {data?.currencyOverview.lastUpdated && (
                <div className="text-xs text-slate-500 px-1">
                  {data.currencyOverview.isCached ? (
                    <span className="text-amber-500">
                      ⚠ Cached rate — last updated{" "}
                      {new Date(data.currencyOverview.lastUpdated).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-emerald-500">
                      ✓ Live rate — updated{" "}
                      {new Date(data.currencyOverview.lastUpdated).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {!data?.currencyOverview.pkrPerUsd && (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-xs">
                    Configure CURRENCY_API_KEY for live rates.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Link href="/dashboard/currency" className="btn-ghost text-sm w-full text-center py-2.5">
                  Open Currency Converter
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <strong>Financial Disclaimer:</strong> Aura Wealth Terminal is an informational
        financial utility. Prize bond results, currency rates and other financial
        information should be verified with authoritative sources (State Bank of
        Pakistan). Aura Wealth Terminal does not guarantee financial outcomes.
      </div>
    </div>
  );
}
