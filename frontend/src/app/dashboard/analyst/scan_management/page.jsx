"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ShieldCheck, Bug, MoreVertical, Eye, Pause, Play, StopCircle, RotateCcw, Trash, Plus, RefreshCw } from "lucide-react";
import NewScanDialog from "@/components/popup/NewScanDialog";
import UpgradePlanModal from "@/components/popup/UpgradePlanModal";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const severityClass = (s) => {
  if (s === 'critical') return 'bg-red-500/10 text-red-400 border border-red-500/20';
  if (s === 'high')     return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
  if (s === 'medium')   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  return 'bg-white/5 text-white/50 border border-white/10';
};

export default function ScanManagement() {
  const router = useRouter();
  const [scans, setScans] = useState([]);
  const [vulns, setVulns] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const pollRef = useRef(null);

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API}/api/scans`, { headers: headers() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setScans(list);
      const allVulns = [];
      for (const scan of list) {
        if (scan.vulnerabilities?.length) {
          scan.vulnerabilities.forEach(v => allVulns.push({ ...v, scanId: scan.id, scanTarget: scan.target }));
        }
      }
      setVulns(allVulns);
    } catch (e) {
      console.error('Failed to fetch scans:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
    pollRef.current = setInterval(fetchScans, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleAction = async (action, scanId) => {
    try {
      const res = await fetch(`${API}/api/scans/${scanId}/${action}`, { method: action === 'delete' ? 'DELETE' : 'POST', headers: headers() });
      if (res.status === 403) {
        const data = await res.json();
        if (data.upgrade_required) { setShowUpgrade(true); return; }
      }
      fetchScans();
    } catch (e) { console.error(`Action ${action} failed:`, e); }
  };

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Scan Management</h1>
          <p className="text-white/40">Monitor and manage your security scans</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchScans} className="p-2 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setOpenDialog(true)} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> New Scan
          </button>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-[#1a1a1a] border border-white/10 p-1 rounded-lg">
          <TabsTrigger value="active" className="h-full text-sm font-semibold px-6 rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
            Active Scans <span className="ml-1 text-xs">({scans.length})</span>
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="h-full text-sm font-semibold px-6 rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
            Vulnerabilities <span className="ml-1 text-xs">({vulns.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-white/40">Loading scans...</div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
              <ShieldCheck className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No scans yet. Start your first scan.</p>
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
                    <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2" onClick={() => router.push(`/dashboard/analyst/scan_management/${scan.id}`)}><Eye className="w-4 h-4" />View Details</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2" onClick={() => handleAction('pause', scan.id)}><Pause className="w-4 h-4" />Pause</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer gap-2" onClick={() => handleAction('resume', scan.id)}><Play className="w-4 h-4" />Resume</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer gap-2" onClick={() => handleAction('stop', scan.id)}><StopCircle className="w-4 h-4" />Stop</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer gap-2" onClick={() => handleAction('rerun', scan.id)}><RotateCcw className="w-4 h-4" />Re-run</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-red-500/10 hover:text-red-400 cursor-pointer gap-2" onClick={() => handleAction('delete', scan.id)}><Trash className="w-4 h-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {scan.status === 'Running' && (
                <>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500" style={{ width: `${scan.progress || 0}%` }} />
                  </div>
                  <p className="text-xs text-white/40 mb-2">{scan.progressMsg || 'Scanning...'}</p>
                </>
              )}

              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{new Date(scan.created_at).toLocaleString()}</span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {scan.issues || scan.vulnerabilities?.length || 0} vulnerabilities
                </span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="vulnerabilities" className="mt-6 space-y-4">
          {vulns.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
              <Bug className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No vulnerabilities found yet.</p>
            </div>
          ) : vulns.map((vuln, i) => (
            <div key={i} onClick={() => router.push(`/dashboard/analyst/scan_management/${vuln.scanId}`)}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-yellow-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-400" />
                    <span className="font-semibold text-white">{vuln.title}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">{vuln.scanTarget} · Scan #{vuln.scanId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityClass(vuln.severity)}`}>
                  {vuln.severity}
                </span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <UpgradePlanModal open={showUpgrade} onClose={() => setShowUpgrade(false)} role="analyst" />
      <NewScanDialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) fetchScans(); }} role="analyst" />
    </div>
  );
}
