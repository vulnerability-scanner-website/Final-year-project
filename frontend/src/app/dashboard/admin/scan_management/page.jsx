"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ShieldCheck, Bug, MoreVertical, Eye, Pause, Play,
  StopCircle, RotateCcw, Trash, RefreshCw, Plus,
} from "lucide-react";
import NewScanDialog from "@/components/popup/NewScanDialog";

const severityClass = (s) => {
  const v = (s || '').toLowerCase();
  if (v === 'critical') return 'bg-red-500/10 text-red-400 border border-red-500/20';
  if (v === 'high')     return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
  if (v === 'medium')   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  return 'bg-white/5 text-white/50 border border-white/10';
};

export default function ScanManagement() {
  const router = useRouter();
  const [scans, setScans] = useState([]);
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const pollRef = useRef(null);

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchAll = async () => {
    try {
      const [scansRes, vulnsRes] = await Promise.all([
        fetch('/api/scans', { headers: headers() }),
        fetch('/api/vulnerabilities', { headers: headers() }),
      ]);

      if (scansRes.ok) {
        const data = await scansRes.json();
        setScans(Array.isArray(data) ? data : []);
      }
      if (vulnsRes.ok) {
        const data = await vulnsRes.json();
        setVulns(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Poll progress for running scans
  const pollProgress = async (scanList) => {
    const running = scanList.filter(s => s.status === 'Running');
    if (!running.length) return;

    const updates = await Promise.all(
      running.map(async (scan) => {
        try {
          const res = await fetch(`/api/scans/${scan.id}/progress`, { headers: headers() });
          if (res.ok) return { id: scan.id, ...(await res.json()) };
        } catch { /* ignore */ }
        return null;
      })
    );

    setScans(prev => prev.map(s => {
      const upd = updates.find(u => u?.id === s.id);
      return upd ? { ...s, progress: upd.progress, progressMsg: upd.message } : s;
    }));
  };

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(async () => {
      await fetchAll();
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Separate lighter poll for progress messages
  useEffect(() => {
    const prog = setInterval(() => pollProgress(scans), 3000);
    return () => clearInterval(prog);
  }, [scans]);

  const handleAction = async (action, scanId) => {
    try {
      await fetch(`/api/scans/${scanId}${action === 'delete' ? '' : `/${action}`}`, {
        method: action === 'delete' ? 'DELETE' : 'POST',
        headers: headers(),
      });
      fetchAll();
    } catch (e) {
      console.error(`Action ${action} failed:`, e);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Scan Management</h1>
          <p className="text-white/40">Monitor and manage all security scans</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setOpenDialog(true)} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> New Scan
          </button>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-[#1a1a1a] border border-white/10 p-1 rounded-lg">
          <TabsTrigger value="active" className="h-full text-sm font-semibold px-6 rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
            Active Scans <span className="ml-1 text-xs">({scans.length})</span>
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="h-full text-sm font-semibold px-6 rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
            Vulnerabilities <span className="ml-1 text-xs">({vulns.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Scans */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-white/40">Loading scans...</div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
              <ShieldCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No scans found.</p>
            </div>
          ) : scans.map((scan) => (
            <div key={scan.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-white truncate">{scan.target}</span>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    scan.status === 'Running'   ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    scan.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    scan.status === 'Failed'    ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    scan.status === 'Paused'    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-white/5 text-white/50 border border-white/10'
                  }`}>{scan.status}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-white/10 text-white">
                    <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2" onClick={() => router.push(`/dashboard/admin/scan_management/${scan.id}`)}>
                      <Eye className="w-4 h-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2" onClick={() => handleAction('pause', scan.id)}>
                      <Pause className="w-4 h-4" /> Pause
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2" onClick={() => handleAction('resume', scan.id)}>
                      <Play className="w-4 h-4" /> Resume
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer gap-2" onClick={() => handleAction('stop', scan.id)}>
                      <StopCircle className="w-4 h-4" /> Stop
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer gap-2" onClick={() => handleAction('rerun', scan.id)}>
                      <RotateCcw className="w-4 h-4" /> Re-run
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-red-500/10 hover:text-red-400 cursor-pointer gap-2" onClick={() => handleAction('delete', scan.id)}>
                      <Trash className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress */}
              {scan.status === 'Running' && (
                <>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${scan.progress || 0}%` }} />
                  </div>
                  <p className="text-xs text-white/40 mb-2">{scan.progressMsg || 'Scanning...'}</p>
                </>
              )}

              {/* Desktop block progress */}
              {scan.status !== 'Running' && (
                <div className="hidden md:flex w-full gap-0.5 overflow-hidden mb-2">
                  {[...Array(100)].map((_, i) => (
                    <span key={i} className={`inline-block w-3 h-3 rounded-sm border flex-shrink-0 transition-colors ${
                      i < (scan.status === 'Completed' ? 100 : scan.progress || 0)
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'bg-white/5 border-white/10'
                    }`} />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="truncate">{new Date(scan.created_at).toLocaleString()}</span>
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {scan.issues || 0} vulnerabilities
                </span>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Vulnerabilities */}
        <TabsContent value="vulnerabilities" className="mt-6 space-y-4">
          {vulns.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
              <Bug className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No vulnerabilities found.</p>
            </div>
          ) : vulns.map((vuln) => (
            <div key={vuln.id}
              onClick={() => router.push(`/dashboard/admin/scan_management/${vuln.scan_id}`)}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-yellow-500/30 transition-all"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="font-semibold text-white truncate">{vuln.title}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1 truncate">Scan #{vuln.scan_id}</p>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${severityClass(vuln.severity)}`}>
                  {vuln.severity}
                </span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <NewScanDialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) fetchAll(); }} role="admin" />
    </div>
  );
}
