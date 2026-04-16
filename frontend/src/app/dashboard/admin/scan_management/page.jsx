"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ShieldCheck, Bug, MoreVertical, Eye, Pause, Play, StopCircle, RotateCcw, Trash, RefreshCw, Plus, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import NewScanDialog from "@/components/popup/NewScanDialog";
import { DashboardHeader } from "@/components/header/header";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const severityClass = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "critical") return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (v === "high")     return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
  if (v === "medium")   return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  if (v === "low")      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  return "bg-white/5 text-white/50 border border-white/10";
};

const statusClass = (s) => {
  if (s === "Running")   return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  if (s === "Completed") return "bg-green-500/10 text-green-400 border border-green-500/20";
  if (s === "Failed")    return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (s === "Paused")    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  if (s === "Stopped")   return "bg-white/10 text-white/50 border border-white/10";
  return "bg-white/5 text-white/40 border border-white/10";
};

export default function AdminScanManagement() {
  const router = useRouter();
  const [scans, setScans] = useState([]);
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchVuln, setSearchVuln] = useState("");
  const pollRef = useRef(null);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchAll = async () => {
    try {
      const [scansRes, vulnsRes] = await Promise.all([
        fetch(`${API}/api/scans`, { headers: headers() }),
        fetch(`${API}/api/vulnerabilities`, { headers: headers() }),
      ]);
      if (scansRes.ok) setScans(Array.isArray(await scansRes.json()) ? await scansRes.clone().json() : []);
      if (vulnsRes.ok) setVulns(Array.isArray(await vulnsRes.json()) ? await vulnsRes.clone().json() : []);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  };

  // Simpler fetch to avoid double-consuming response body
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const h = { Authorization: `Bearer ${token}` };

      const [s, v] = await Promise.all([
        fetch(`${API}/api/scans`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/vulnerabilities`, { headers: h }).then(r => r.json()),
      ]);

      setScans(Array.isArray(s) ? s : []);
      setVulns(Array.isArray(v) ? v : []);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  };

  // Poll progress for running scans
  const pollProgress = async () => {
    const running = scans.filter(s => s.status === "Running");
    if (!running.length) return;
    const updates = await Promise.all(
      running.map(async (scan) => {
        try {
          const res = await fetch(`${API}/api/scans/${scan.id}/progress`, { headers: headers() });
          if (res.ok) return { id: scan.id, ...(await res.json()) };
        } catch {}
        return null;
      })
    );
    setScans(prev => prev.map(s => {
      const upd = updates.find(u => u?.id === s.id);
      return upd ? { ...s, progress: upd.progress, progressMsg: upd.message } : s;
    }));
  };

  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    const prog = setInterval(pollProgress, 3000);
    return () => clearInterval(prog);
  }, [scans]);

  const handleAction = async (action, scanId) => {
    try {
      await fetch(`${API}/api/scans/${scanId}${action === "delete" ? "" : `/${action}`}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: headers(),
      });
      loadData();
    } catch (e) { console.error(`Action ${action} failed:`, e); }
  };

  // Stats
  const stats = {
    total: scans.length,
    running: scans.filter(s => s.status === "Running").length,
    completed: scans.filter(s => s.status === "Completed").length,
    failed: scans.filter(s => s.status === "Failed").length,
  };

  const severities = ["all", "critical", "high", "medium", "low", "info"];
  const filteredVulns = vulns.filter(v => {
    const matchSev = severityFilter === "all" || v.severity?.toLowerCase() === severityFilter;
    const matchSearch = !searchVuln || v.title?.toLowerCase().includes(searchVuln.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white space-y-6">
      <DashboardHeader role="scanmanagement" onActionClick={() => setOpenDialog(true)} />

      <div className="space-y-6 px-1">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Scans",  value: stats.total,     icon: ShieldCheck,   color: "text-yellow-400 bg-yellow-500/10" },
            { label: "Running",      value: stats.running,   icon: Clock,         color: "text-blue-400 bg-blue-500/10" },
            { label: "Completed",    value: stats.completed, icon: CheckCircle,   color: "text-green-400 bg-green-500/10" },
            { label: "Failed",       value: stats.failed,    icon: AlertTriangle, color: "text-red-400 bg-red-500/10" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-[#1a1a1a] border border-white/10 p-1 rounded-lg">
            <TabsTrigger value="active" className="h-full text-sm font-semibold rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
              Scans ({scans.length})
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="h-full text-sm font-semibold rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
              Vulnerabilities ({vulns.length})
            </TabsTrigger>
          </TabsList>

          {/* Scans Tab */}
          <TabsContent value="active" className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-white/40">Loading scans...</div>
            ) : scans.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
                <ShieldCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No scans found.</p>
              </div>
            ) : scans.map((scan) => (
              <div key={scan.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{scan.target}</p>
                      <p className="text-xs text-white/30">Scan #{scan.id} · {new Date(scan.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(scan.status)}`}>
                      {scan.status}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-white/10 text-white min-w-[160px]">
                      <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2 text-sm" onClick={() => router.push(`/dashboard/admin/scan_management/${scan.id}`)}>
                        <Eye className="w-4 h-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2 text-sm" onClick={() => handleAction("pause", scan.id)}>
                        <Pause className="w-4 h-4" /> Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2 text-sm" onClick={() => handleAction("resume", scan.id)}>
                        <Play className="w-4 h-4" /> Resume
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer gap-2 text-sm" onClick={() => handleAction("stop", scan.id)}>
                        <StopCircle className="w-4 h-4" /> Stop
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer gap-2 text-sm" onClick={() => handleAction("rerun", scan.id)}>
                        <RotateCcw className="w-4 h-4" /> Re-run
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="hover:bg-red-500/10 hover:text-red-400 cursor-pointer gap-2 text-sm" onClick={() => handleAction("delete", scan.id)}>
                        <Trash className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress bar for running scans */}
                {scan.status === "Running" && (
                  <div className="mb-2">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500" style={{ width: `${scan.progress || 0}%` }} />
                    </div>
                    <p className="text-xs text-white/40 mt-1">{scan.progressMsg || "Scanning..."} — {scan.progress || 0}%</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> User #{scan.user_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    {scan.issues || 0} vulnerabilities
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <input
                value={searchVuln}
                onChange={e => setSearchVuln(e.target.value)}
                placeholder="Search vulnerabilities..."
                className="flex-1 min-w-[200px] bg-[#1a1a1a] border border-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm"
              />
              <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm">
                {severities.map(s => <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>

            {/* Severity summary badges */}
            <div className="flex gap-2 flex-wrap">
              {["critical","high","medium","low"].map(s => {
                const count = vulns.filter(v => v.severity?.toLowerCase() === s).length;
                return count > 0 ? (
                  <button key={s} onClick={() => setSeverityFilter(severityFilter === s ? "all" : s)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${severityFilter === s ? severityClass(s) : "bg-white/5 text-white/40 border-white/10"}`}>
                    {count} {s}
                  </button>
                ) : null;
              })}
            </div>

            {filteredVulns.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
                <Bug className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">{vulns.length === 0 ? "No vulnerabilities found." : "No results match your filter."}</p>
              </div>
            ) : filteredVulns.map((vuln) => (
              <div key={vuln.id}
                onClick={() => router.push(`/dashboard/admin/scan_management/${vuln.scan_id}`)}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-yellow-500/30 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Bug className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white group-hover:text-yellow-400 transition truncate">{vuln.title}</p>
                      {vuln.affected_url && <p className="text-xs text-white/40 mt-0.5 truncate">{vuln.affected_url}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                        <span>Scan #{vuln.scan_id}</span>
                        {vuln.scanner_type && <span>· {vuln.scanner_type}</span>}
                        {vuln.cwe_id && <span>· CWE-{vuln.cwe_id}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${severityClass(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <NewScanDialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) loadData(); }} role="admin" />
    </div>
  );
}
