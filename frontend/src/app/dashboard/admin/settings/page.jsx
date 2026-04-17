"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings, Users, Shield, Bell, Save, RefreshCw, Loader2,
  CheckCircle, XCircle, Clock, RotateCcw, ChevronDown, Search,
  Activity, Bug, CreditCard, UserCheck
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const token = () => localStorage.getItem("token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });


function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-yellow-500" : "bg-white/20"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}


function StatusBadge({ status }) {
  const s = {
    active:   "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-red-500/10 text-red-400 border-red-500/20",
    pending:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }[status] || "bg-white/5 text-white/40 border-white/10";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s} capitalize`}>{status}</span>;
}


function RoleBadge({ role }) {
  const r = {
    admin:     "bg-purple-500/10 text-purple-400 border-purple-500/20",
    developer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    analyst:   "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }[role] || "bg-white/5 text-white/40 border-white/10";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${r} capitalize`}>{role}</span>;
}

const inputCls = "w-full bg-[#101010] border border-white/10 text-white placeholder-white/30 px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("system");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // System settings state
  const [sysSettings, setSysSettings] = useState({
    systemName: "CyberTrace Security Scanner",
    supportEmail: "admin@security.com",
    allowRegistration: true,
    autoApproveUsers: true,
    maintenanceMode: false,
    maxScansPerUser: 3,
    scanTimeout: 300,
  });

  // Stats
  const [stats, setStats] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  // Security / password
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    notifyOnLogin: true,
    notifyOnNewUser: true,
    notifyOnScanComplete: true,
    notifyOnScanFail: true,
    notifyOnPayment: true,
  });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  // Load system settings + stats
  const loadSystem = useCallback(async () => {
    try {
      const [sysRes, statsRes] = await Promise.all([
        fetch(`${API}/api/admin/settings/system`, { headers: headers() }),
        fetch(`${API}/api/admin/settings/stats`, { headers: headers() }),
      ]);
      if (sysRes.ok) {
        const data = await sysRes.json();
        setSysSettings(prev => ({ ...prev, ...data }));
        if (data.notifSettings) setNotifSettings(data.notifSettings);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {}
  }, []);

  // Load users
  const loadUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/settings/users`, { headers: headers() });
      if (res.ok) setUsers(await res.json());
    } catch {} finally { setUserLoading(false); }
  }, []);

  useEffect(() => {
    loadSystem();
    loadUsers();
  }, [loadSystem, loadUsers]);

  // Save system settings
  const saveSystem = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/settings/system`, {
        method: "PUT", headers: headers(),
        body: JSON.stringify({ ...sysSettings, notifSettings }),
      });
      if (res.ok) showMsg("success", "System settings saved successfully");
      else showMsg("error", "Failed to save settings");
    } catch { showMsg("error", "Network error"); } finally { setSaving(false); }
  };

  // Change password
  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass) return showMsg("error", "Fill in all fields");
    if (passwords.newPass !== passwords.confirm) return showMsg("error", "Passwords do not match");
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/settings/password`, {
        method: "PUT", headers: headers(),
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (res.ok) { showMsg("success", "Password updated"); setPasswords({ current: "", newPass: "", confirm: "" }); }
      else showMsg("error", data.error || "Failed to update password");
    } catch { showMsg("error", "Network error"); } finally { setSaving(false); }
  };

  // Update user role
  const updateRole = async (userId, role) => {
    try {
      const res = await fetch(`${API}/api/admin/settings/users/${userId}/role`, {
        method: "PATCH", headers: headers(), body: JSON.stringify({ role }),
      });
      if (res.ok) { loadUsers(); showMsg("success", "Role updated"); }
      else showMsg("error", "Failed to update role");
    } catch {}
  };

  // Update user status
  const updateStatus = async (userId, status) => {
    try {
      const res = await fetch(`${API}/api/admin/settings/users/${userId}/status`, {
        method: "PATCH", headers: headers(), body: JSON.stringify({ status }),
      });
      if (res.ok) { loadUsers(); showMsg("success", "Status updated"); }
      else showMsg("error", "Failed to update status");
    } catch {}
  };

  // Reset free scans
  const resetScans = async (userId) => {
    try {
      const res = await fetch(`${API}/api/admin/settings/users/${userId}/reset-scans`, {
        method: "PATCH", headers: headers(), body: "{}",
      });
      if (res.ok) { loadUsers(); showMsg("success", "Free scans reset"); }
    } catch {}
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const TABS = [
    { id: "system",  label: "System",       icon: Settings },
    { id: "users",   label: "User Access",  icon: Users },
    { id: "security",label: "Security",     icon: Shield },
    { id: "notif",   label: "Notifications",icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#101010] text-white space-y-6">
      <div className="space-y-6 px-1">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
            <p className="text-white/40 text-sm">Control system configuration and user access</p>
          </div>
          {(tab === "system" || tab === "notif") && (
            <button onClick={saveSystem} disabled={saving}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div className={`px-4 py-3 rounded-xl text-sm border flex items-center gap-2 ${
            msg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {msg.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Users",    value: stats.users?.total || 0,           icon: Users,      color: "text-yellow-400 bg-yellow-500/10" },
              { label: "Active Users",   value: stats.users?.active || 0,          icon: UserCheck,  color: "text-green-400 bg-green-500/10" },
              { label: "Total Scans",    value: stats.scans?.total || 0,           icon: Activity,   color: "text-blue-400 bg-blue-500/10" },
              { label: "Vulnerabilities",value: stats.vulnerabilities?.total || 0, icon: Bug,        color: "text-red-400 bg-red-500/10" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-white/40">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1a1a] border border-white/10 p-1 rounded-xl w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === id ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black" : "text-white/50 hover:text-white"
              }`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── SYSTEM TAB ─────────────────────────────────────────────────────── */}
        {tab === "system" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* General */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Settings className="h-4 w-4 text-yellow-400" /> General Configuration</h3>
              <div>
                <label className="text-xs text-white/50 mb-1 block">System Name</label>
                <input value={sysSettings.systemName} onChange={e => setSysSettings(p => ({ ...p, systemName: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Support Email</label>
                <input value={sysSettings.supportEmail} onChange={e => setSysSettings(p => ({ ...p, supportEmail: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Free Scans Per User</label>
                <input type="number" min="1" max="100" value={sysSettings.maxScansPerUser}
                  onChange={e => setSysSettings(p => ({ ...p, maxScansPerUser: parseInt(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Scan Timeout (seconds)</label>
                <input type="number" min="60" max="3600" value={sysSettings.scanTimeout}
                  onChange={e => setSysSettings(p => ({ ...p, scanTimeout: parseInt(e.target.value) }))} className={inputCls} />
              </div>
            </div>

            {/* Access Control Toggles */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Shield className="h-4 w-4 text-yellow-400" /> Access Control</h3>
              {[
                { key: "allowRegistration",  label: "Allow New Registrations",  desc: "Users can self-register accounts" },
                { key: "autoApproveUsers",   label: "Auto-Approve New Users",   desc: "Automatically activate new accounts" },
                { key: "maintenanceMode",    label: "Maintenance Mode",         desc: "Block all non-admin access" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <Toggle value={sysSettings[key]} onChange={v => setSysSettings(p => ({ ...p, [key]: v }))} />
                </div>
              ))}

              {sysSettings.maintenanceMode && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                  ⚠️ Maintenance mode is ON — only admins can access the system.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USER ACCESS TAB ────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by email or role..."
                  className={`${inputCls} pl-9`} />
              </div>
              <button onClick={loadUsers} className="p-2.5 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 border border-white/10 transition">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {userLoading ? (
              <div className="text-center py-12 text-white/40"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading users...</div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div key={user.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* User info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-400 font-bold text-sm">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <RoleBadge role={user.role} />
                            <StatusBadge status={user.status} />
                            <span className="text-xs text-white/30">{user.scan_count} scans · {user.free_scans_used}/3 free used</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Role selector */}
                        <select
                          value={user.role}
                          onChange={e => updateRole(user.id, e.target.value)}
                          className="bg-[#101010] border border-white/10 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-yellow-500 transition"
                        >
                          <option value="developer">Developer</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Status toggle */}
                        {user.status === "active" ? (
                          <button onClick={() => updateStatus(user.id, "inactive")}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">
                            <XCircle className="h-3 w-3" /> Deactivate
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(user.id, "active")}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition">
                            <CheckCircle className="h-3 w-3" /> Activate
                          </button>
                        )}

                        {/* Reset scans */}
                        <button onClick={() => resetScans(user.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition"
                          title="Reset free scan count">
                          <RotateCcw className="h-3 w-3" /> Reset Scans
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-white/40">No users found.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SECURITY TAB ───────────────────────────────────────────────────── */}
        {tab === "security" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Change Password */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Shield className="h-4 w-4 text-yellow-400" /> Change Admin Password</h3>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Current Password</label>
                <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">New Password</label>
                <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Confirm New Password</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className={inputCls} placeholder="••••••••" />
              </div>
              <button onClick={changePassword} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition text-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update Password
              </button>
            </div>

            {/* Security Info */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Shield className="h-4 w-4 text-yellow-400" /> Security Overview</h3>
              {[
                { label: "JWT Authentication",    status: "active",  desc: "Token-based auth enabled" },
                { label: "Rate Limiting",          status: "active",  desc: "100 requests/minute per user" },
                { label: "CORS Protection",        status: "active",  desc: "Frontend origin whitelisted" },
                { label: "Password Hashing",       status: "active",  desc: "bcrypt with 10 salt rounds" },
                { label: "SQL Injection Protection",status: "active", desc: "Parameterized queries used" },
              ].map(({ label, status, desc }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ──────────────────────────────────────────────── */}
        {tab === "notif" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Bell className="h-4 w-4 text-yellow-400" /> Admin Notification Preferences</h3>
              {[
                { key: "notifyOnLogin",        label: "User Login Alerts",       desc: "Notify when a user logs in" },
                { key: "notifyOnNewUser",       label: "New User Registration",   desc: "Notify when a new user registers" },
                { key: "notifyOnScanComplete",  label: "Scan Completed",          desc: "Notify when any scan completes" },
                { key: "notifyOnScanFail",      label: "Scan Failed",             desc: "Notify when a scan fails" },
                { key: "notifyOnPayment",       label: "Payment Received",        desc: "Notify on new subscription payment" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <Toggle value={notifSettings[key]} onChange={v => setNotifSettings(p => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Bell className="h-4 w-4 text-yellow-400" /> Notification Summary</h3>
              <p className="text-sm text-white/40">Currently enabled notifications:</p>
              <div className="space-y-2">
                {Object.entries(notifSettings).filter(([, v]) => v).map(([k]) => (
                  <div key={k} className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    {k.replace(/([A-Z])/g, ' $1').replace('notify On ', '').trim()}
                  </div>
                ))}
                {Object.values(notifSettings).every(v => !v) && (
                  <p className="text-white/30 text-sm">All notifications disabled.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
