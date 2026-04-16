"use client";
import { useEffect, useState, useCallback } from "react";
import { Bell, Trash2, CheckCheck, Trash, RefreshCw } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
const TYPE_STYLES = {
  success: { dot: "bg-green-500", badge: "text-green-300 bg-green-500/20" },
  error: { dot: "bg-red-500", badge: "text-red-300 bg-red-500/20" },
  warning: { dot: "bg-yellow-400", badge: "text-yellow-300 bg-yellow-500/20" },
  scan: { dot: "bg-blue-500", badge: "text-blue-300 bg-blue-500/20" },
  user: { dot: "bg-purple-500", badge: "text-purple-300 bg-purple-500/20" },
  info: { dot: "bg-gray-400", badge: "text-gray-300 bg-gray-500/20" },
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

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
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

  // 🔍 FILTER
  const filteredNotifications = notifications.filter(
    (n) =>
      (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (n.message || "").toLowerCase().includes(search.toLowerCase()),
  );

  // 📄 PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / itemsPerPage),
  );

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#101010] text-white w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 border border-white/10"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-green-400 hover:bg-green-400/10 border border-green-400/20"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 border border-red-400/20"
            >
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20 text-white/40">
          <RefreshCw className="animate-spin mr-2" size={18} /> Loading...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          No notifications found
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedNotifications.map((n) => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;

            return (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className="group relative flex items-start gap-4 p-4 rounded-xl border bg-[#1e1e1e] border-white/10 hover:border-yellow-500/30 transition cursor-pointer"
              >
                {!n.read && (
                  <span
                    className={`absolute top-4 right-4 w-2 h-2 rounded-full ${style.dot}`}
                  />
                )}

                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${style.badge}`}
                >
                  <Bell size={14} />
                </div>

                <div className="flex-1">
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="font-semibold text-sm">
                      {n.title || "Notification"}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded ${style.badge}`}
                    >
                      {n.type || "info"}
                    </span>
                  </div>

                  <p className="text-white/70 text-sm mt-1">{n.message}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {timeAgo(n.created_at)}
                  </p>
                </div>

                {/* DELETE BUTTON FIXED */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="text-white/40 hover:text-red-400 transition"
                >
                  <Trash size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 rounded bg-white/10"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-yellow-500 text-black" : "bg-white/10"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1 rounded bg-white/10"
        >
          Next
        </button>
      </div>
    </div>
  );
}
