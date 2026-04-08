"use client";

import { useState, useEffect } from "react";
import { Save, Key, Lock, Bell, User, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/header/header";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function DeveloperSettings() {
  const [user, setUser] = useState({ email: "", role: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [notifications, setNotifications] = useState({ email: true, scanAlerts: true, weeklyReports: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUser({ email: u.email || "", role: u.role || "developer" });
  }, []);

  const handleSavePassword = async () => {
    if (!passwords.current || !passwords.newPass) return setMsg({ type: "error", text: "Fill in all password fields" });
    if (passwords.newPass !== passwords.confirm) return setMsg({ type: "error", text: "New passwords do not match" });
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/settings/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "Password updated successfully" });
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const inputClass = "w-full bg-[#101010] border border-white/10 text-white placeholder-white/30 px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm";

  return (
    <div className="min-h-screen bg-[#101010] text-white space-y-6">
      <DashboardHeader role="settings" />

      <div className="space-y-6 px-1">
        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm border ${msg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {msg.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Profile Information</h3>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Email</label>
              <input value={user.email} readOnly className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Role</label>
              <input value={user.role} readOnly className={`${inputClass} opacity-60 cursor-not-allowed capitalize`} />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Notification Preferences</h3>
            </div>
            {[
              { key: "email",        label: "Email Notifications",  desc: "Receive notifications via email" },
              { key: "scanAlerts",   label: "Scan Alerts",          desc: "Get alerts when scans complete" },
              { key: "weeklyReports",label: "Weekly Reports",       desc: "Receive weekly summary reports" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/40">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? "bg-yellow-500" : "bg-white/10"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[key] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Change Password */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Change Password</h3>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Current Password</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">New Password</label>
              <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className={inputClass} placeholder="••••••••" />
            </div>
            <button
              onClick={handleSavePassword}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>

          {/* API Key */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">API Access</h3>
            </div>
            <p className="text-sm text-white/40">Generate an API key to integrate with external tools and CI/CD pipelines.</p>
            <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-lg transition text-sm">
              <Key className="h-4 w-4" /> Generate API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
