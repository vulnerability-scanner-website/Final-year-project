"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShieldCheck, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import NewScanDialog from "@/components/popup/NewScanDialog";
import { vulnerabilitiesAPI } from "@/lib/api";

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
  medium:   <ShieldCheck className="h-4 w-4 text-yellow-400" />,
  low:      <ShieldCheck className="h-4 w-4 text-blue-400" />,
  info:     <ShieldCheck className="h-4 w-4 text-white/40" />,
};

export default function SecurityFindingsPage() {
  const router = useRouter();
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchVulns = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const data = await vulnerabilitiesAPI.getAll();
      setVulns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load vulnerabilities:", error);
      setVulns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVulns();
  }, [fetchVulns]);

  const severities = ["all", "critical", "high", "medium", "low", "info"];
  const counts = severities.reduce((acc, s) => {
    acc[s] = s === "all"
      ? vulns.length
      : vulns.filter(v => v.severity?.toLowerCase() === s).length;
    return acc;
  }, {});

  const filtered = vulns.filter(v => {
    const severityMatch = filter === "all" || v.severity?.toLowerCase() === filter;
    const query = search.toLowerCase();
    const searchMatch = !query ||
      v.title?.toLowerCase().includes(query) ||
      v.scanner_type?.toLowerCase().includes(query) ||
      v.target?.toLowerCase().includes(query) ||
      v.affected_url?.toLowerCase().includes(query);
    return severityMatch && searchMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedVulns = filtered.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 md:left-64 z-30 bg-[#101010] border-b border-white/10 py-4 px-4 sm:px-6 lg:px-8 shadow-black/20 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-screen-2xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white">Security Findings</h1>
            <p className="text-white/40 mt-1">View and manage the latest vulnerability findings from your scans.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={fetchVulns}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2 text-sm text-white/80 hover:border-yellow-400/30 hover:text-white transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => setOpenDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 transition"
            >
              <Plus className="h-4 w-4" /> New Scan
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 pt-32 md:pt-28">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search findings by title, target, scanner, or affected URL..."
            className="flex-1 rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-white/30 focus:border-yellow-500 focus:outline-none transition"
          />
          <select
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-xs rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white focus:border-yellow-500 focus:outline-none transition"
          >
            {severities.map(s => (
              <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/40">Loading findings...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center rounded-xl border border-white/10 bg-[#1a1a1a] p-12 text-white/40">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-white/20" />
            <p>{vulns.length === 0 ? "No findings found yet. Run a scan to populate the report." : "No findings match your current filter."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedVulns.map((vuln) => (
              <div
                key={vuln.id}
                onClick={() => router.push(`/dashboard/analyst/scan_management/${vuln.scan_id}`)}
                className="group cursor-pointer rounded-xl border border-white/10 bg-[#1a1a1a] p-5 transition hover:border-yellow-500/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1">{SEVERITY_ICON[vuln.severity?.toLowerCase()] || SEVERITY_ICON.info}</div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-white group-hover:text-yellow-400 transition">{vuln.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/40">
                        {vuln.target && <span>{vuln.target}</span>}
                        {vuln.affected_url && <span>{vuln.affected_url}</span>}
                        {vuln.scanner_type && <span>{vuln.scanner_type}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${SEVERITY_STYLE[vuln.severity?.toLowerCase()] || SEVERITY_STYLE.info}`}>
                    {vuln.severity || 'Info'}
                  </span>
                </div>

                {vuln.description && (
                  <p className="mt-3 text-sm leading-6 text-white/40 line-clamp-2">{vuln.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/40">
                  <span>Scan #{vuln.scan_id}</span>
                  {vuln.cwe_id && <span>CWE-{vuln.cwe_id}</span>}
                  {vuln.cvss_score && <span>CVSS {vuln.cvss_score}</span>}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
                <div className="flex gap-2 text-sm text-white/40 items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80 hover:border-yellow-400/30 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80 hover:border-yellow-400/30 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <NewScanDialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) fetchVulns(); }} role="analyst" />
    </div>
  );
}
