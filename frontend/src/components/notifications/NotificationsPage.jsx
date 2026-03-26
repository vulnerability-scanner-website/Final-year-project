"use client";
import { useEffect, useState, useCallback } from "react";
import { Bell, Trash2, CheckCheck, Trash, RefreshCw } from "lucide-react";
import { notificationsAPI } from "@/lib/api";

const TYPE_STYLES = {
  success: { dot: "bg-green-400", badge: "text-green-400 bg-green-400/10" },
  error:   { dot: "bg-red-400",   badge: "text-red-400 bg-red-400/10" },
  warning: { dot: "bg-yellow-400",badge: "text-yellow-400 bg-yellow-400/10" },
  scan:    { dot: "bg-blue-400",  badge: "text-blue-400 bg-blue-400/10" },
  user:    { dot: "bg-purple-400",badge: "text-purple-400 bg-purple-400/10" },
  info:    { dot: "bg-white/40",  badge: "text-white/50 bg-white/5" },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationsAPI.deleteAll();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#101010] text-white w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="text-yellow-400" size={28} />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Stay updated with all system activity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-green-400 hover:bg-green-400/10 border border-green-400/20 transition"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 border border-red-400/20 transition"
            >
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <RefreshCw className="animate-spin mr-2" size={18} /> Loading...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          Failed to load notifications: {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <Bell size={48} className="mb-3 opacity-30" />
          <p className="text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer group
                  ${n.read
                    ? "bg-[#1a1a1a] border-white/5 opacity-60"
                    : "bg-[#1e1e1e] border-white/10 hover:border-yellow-500/30"
                  }`}
              >
                {/* Unread dot */}
                {!n.read && (
                  <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${style.dot}`} />
                )}

                {/* Icon */}
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base ${style.badge}`}>
                  <Bell size={14} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">
                      {n.title || "Notification"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                      {n.type || "info"}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-white/30 text-xs mt-1">{timeAgo(n.created_at)}</p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition shrink-0"
                >
                  <Trash size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
