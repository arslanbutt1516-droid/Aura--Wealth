"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Wallet, TrendingUp, Bell,
  User, Settings, LogOut, Menu, X, Home, BarChart2,
  ChevronRight, Zap, Bot,
} from "lucide-react";
import AuraLogo from "@/components/AuraLogo";

const sidebarLinks = [
  { href: "/dashboard",              label: "Dashboard",     icon: LayoutDashboard },
  { href: "/dashboard/bonds",        label: "My Bonds",      icon: Wallet },
  { href: "/dashboard/currency",     label: "Currency",      icon: TrendingUp },
  { href: "/dashboard/assistant",    label: "AI Assistant",  icon: Bot },
  { href: "/dashboard/analytics",    label: "Analytics",     icon: BarChart2 },
  { href: "/dashboard/notifications",label: "Notifications", icon: Bell },
  { href: "/dashboard/profile",      label: "Profile",       icon: User },
  { href: "/dashboard/settings",     label: "Settings",      icon: Settings },
];

const mobileNavLinks = [
  { href: "/dashboard",          label: "Home",     icon: Home },
  { href: "/dashboard/bonds",    label: "Bonds",    icon: Wallet },
  { href: "/dashboard/currency", label: "Currency", icon: TrendingUp },
  { href: "/dashboard/assistant",label: "AI Bot",   icon: Bot },
  { href: "/dashboard/profile",  label: "Profile",  icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // Run BOTH requests in parallel (not one after the other)
    Promise.all([
      fetch("/api/auth/me", { signal }).then((r) => r.json()).catch(() => null),
      fetch("/api/notifications?unread=true", { signal }).then((r) => r.json()).catch(() => null),
    ]).then(([meData, notifData]) => {
      if (meData?.success) setUserName(meData.data?.name?.split(" ")[0] || "User");
      if (notifData?.success) setUnreadCount(notifData.data?.unreadCount || 0);
    });

    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const pageTitle = pathname === "/dashboard"
    ? "Dashboard"
    : (pathname.split("/").pop() || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#02040f] flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-[#080d1f] border-r border-white/[0.06] z-40 transform transition-transform duration-300 flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <AuraLogo className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-black text-white text-sm tracking-tight leading-none">
                Aura <span className="gradient-text">Wealth</span>
              </div>
              <div className="text-[9px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">Terminal AI</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/8"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
            Main
          </p>
          {sidebarLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive(link.href) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.href === "/dashboard/notifications" && unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          ))}

          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-2">
            Account
          </p>
          {sidebarLinks.slice(4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive(link.href) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Upgrade banner */}
        <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/10 border border-sky-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-bold text-sky-300">Pro Features</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Unlimited bonds, live alerts & advanced analytics
          </p>
          <div className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
            Coming soon <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {userName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 font-medium">Free Account</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/8 hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#02040f]/90 backdrop-blur-2xl px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors font-medium">
                Dashboard
              </Link>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-white font-semibold">{pageTitle}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            {/* Avatar */}
            <Link
              href="/dashboard/profile"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-xs font-black text-white hover:opacity-85 transition-opacity shadow-md shadow-sky-500/20"
              aria-label="Profile"
            >
              {userName[0]?.toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 py-6 pb-24 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#080d1f]/95 backdrop-blur-2xl border-t border-white/[0.06] px-2 py-1.5">
        <div className="flex justify-around">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                isActive(link.href)
                  ? "text-sky-400 bg-sky-500/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
