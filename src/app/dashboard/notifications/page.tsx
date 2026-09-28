"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw, BellOff, Trash2 } from "lucide-react";

interface Notification {
  id: string; type: string; title: string; message: string;
  channel: string; isRead: boolean; createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  prize_win: "🏆", upcoming_draw: "📅", draw_result: "📋",
  currency_alert: "💱", account_activity: "👤", system: "⚙️",
};

const TYPE_COLORS: Record<string, string> = {
  prize_win: "border-emerald-500/30 bg-emerald-500/5",
  upcoming_draw: "border-violet-500/30 bg-violet-500/5",
  draw_result: "border-blue-500/30 bg-blue-500/5",
  currency_alert: "border-amber-500/30 bg-amber-500/5",
  account_activity: "border-brand-500/30 bg-brand-500/5",
  system: "border-slate-500/30 bg-slate-500/5",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(p => Math.max(0, p - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(p => p.filter(n => n.id !== id));
      // Update unread count if it was unread
      const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
      if (wasUnread) setUnreadCount(p => Math.max(0, p - 1));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">
            {unreadCount > 0 ? (
              <span className="text-brand-400 font-medium">{unreadCount} unread</span>
            ) : "All caught up! 🎉"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllRead}
              className="btn-ghost text-sm flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
            aria-label="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="premium-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-300 font-medium mb-1">No notifications yet.</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            You&apos;ll receive notifications here when your bonds win, draws are announced, or currency alerts trigger.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all group ${
                n.isRead
                  ? "bg-white/3 border-white/5"
                  : (TYPE_COLORS[n.type] || "bg-brand-500/5 border-brand-500/20")
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.isRead ? "text-slate-300" : "text-white"}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!n.isRead && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-brand-400 mt-0.5" />
                          <button
                            onClick={() => markRead(n.id)}
                            className="text-xs text-brand-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-lg hover:bg-brand-500/10"
                          >
                            Mark read
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        disabled={deleting === n.id}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-500/10"
                        aria-label="Delete notification"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deleting === n.id ? "animate-pulse" : ""}`} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-2">
                    {new Date(n.createdAt).toLocaleString()} · {n.channel.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <p className="text-xs text-slate-600 text-center">
          Click a notification to mark it as read. Hover to reveal actions.
        </p>
      )}
    </div>
  );
}
