"use client";

import { useState, useEffect, useCallback } from "react";
import { Bug, ShieldCheck, AlertTriangle, Info, RefreshCw, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/header/header";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const SEVERITY_STYLE = {
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
  high:     "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  medium:   "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  low:      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  info:     "bg-white/5 text-white/50 border border-white/10",
};

const SEVERITY_ICON = {
  critical: <AlertTriangle className="h-4 w-4 text-red-400" />,
  high:     <AlertTriangle className="h-4 w-4 text-orange-400" />,
  medium:   <Bug className="h-4 w-4 text-yellow-400" />,
  low:      <Info className="h-4 w-4 text-blue-400" />,
  info:     <Info className="h-4 w-4 text-white/40" />,
};

export default function SecurityFindingsPage() {
  const router = useRouter();
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchVulns = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/vulnerabilities`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setVulns(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVulns(); }, [fetchVulns]);

  const severities = ["all", "critical", "high", "medium", "low", "info"];
  const counts = severities.reduce((acc, s) => {
    acc[s] = s === "all" ? vulns.length : vulns.filter(v => v.severity?.toLowerCase() === s).length;
    return acc;
  }, {});

  const filtered = vulns.filter(v => {
    const matchSev = filter === "all" || v.severity?.toLowerCase() === filter;
    const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase()) || v.affected_url?.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#101010] text-white space-y-6">
      <DashboardHeader role="developer" />

      <div className="space-y-6 px-1">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Security Findings</h1>
            <p className="text-white/40 text-sm">All vulnerabilities detected across your scans</p>
          </div>
          <button onClick={fetchVulns} className="p-2 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {["critical","high","medium","low","info"].map(s => (
            <button key={s} onClick={() => setFilter(s === filter ? "all" : s)}
              className={`rounded-xl p-3 border text-center transition ${filter === s ? SEVERITY_STYLE[s] : "bg-[#1a1a1a] border-white/10 text-white/50 hover:border-white/20"}`}>
              <p className="text-xl font-bold">{counts[s]}</p>
              <p className="text-xs capitalize mt-0.5">{s}</p>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex gap-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vulnerabilities..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm">
            {severities.map(s => <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-white/40">Loading findings...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1a1a] border border-white/10 rounded-xl">
            <ShieldCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">{vulns.length === 0 ? "No vulnerabilities found yet. Run a scan to get started." : "No results match your filter."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => (
              <div key={v.id} onClick={() => router.push(`/dashboard/developer/scan_management/${v.scan_id}`)}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-yellow-500/30 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">{SEVERITY_ICON[v.severity?.toLowerCase()] || SEVERITY_ICON.info}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white group-hover:text-yellow-400 transition truncate">{v.title}</p>
                      {v.affected_url && <p className="text-xs text-white/40 mt-0.5 truncate">{v.affected_url}</p>}
                      {v.description && <p className="text-xs text-white/30 mt-1 line-clamp-2">{v.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                        <span>Scan #{v.scan_id}</span>
                        {v.scanner_type && <span>· {v.scanner_type}</span>}
                        {v.cwe_id && <span>· CWE-{v.cwe_id}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${SEVERITY_STYLE[v.severity?.toLowerCase()] || SEVERITY_STYLE.info}`}>
                    {v.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
