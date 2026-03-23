"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardToolbar,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button-1";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck, Bug, MoreVertical, Eye, Pause, Play, StopCircle, RotateCcw, Trash } from "lucide-react";
import { DashboardHeader } from "@/components/header/header";
import { bg } from "date-fns/locale";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ScanManagement() {
  const router = useRouter();
  const [activeScans, setActiveScans] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [scanProgress, setScanProgress] = useState({});

  // Poll for progress of running scans
  useEffect(() => {
    const pollProgress = async () => {
      const runningScans = activeScans.filter(s => s.status === 'Running');
      
      if (runningScans.length === 0) return; // Skip if no running scans
      
      for (const scan of runningScans) {
        try {
          const token = localStorage.getItem('token');
          const progressRes = await fetch(`${API_URL}/api/scans/${scan.id}/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setScanProgress(prev => ({
              ...prev,
              [scan.id]: progressData
            }));
          }
        } catch (error) {
          // Silently ignore fetch errors for progress
        }
      }
    };
    
    if (activeScans.length > 0) {
      const progressInterval = setInterval(pollProgress, 2000);
      return () => clearInterval(progressInterval);
    }
  }, [activeScans]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch scans
        const scansRes = await fetch(`${API_URL}/api/scans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (scansRes.ok) {
          const scans = await scansRes.json();
          const formattedScans = scans.map(scan => {
            const progress = scanProgress[scan.id];
            return {
              id: scan.id,
              name: `Scan #${scan.id}`,
              target: scan.target,
              status: scan.status,
              progress: scan.status === 'Completed' ? 100 : 
                       scan.status === 'Failed' ? 0 :
                       progress?.progress || 0,
              message: progress?.message || (scan.status === 'Running' ? 'Scanning...' : scan.status),
              started: new Date(scan.created_at).toLocaleString(),
              issues: scan.issues || 0
            };
          });
          setActiveScans(formattedScans);
        }
        
        // Fetch vulnerabilities
        const vulnRes = await fetch(`${API_URL}/api/vulnerabilities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (vulnRes.ok) {
          const vulns = await vulnRes.json();
          setVulnerabilities(vulns);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000); // Reduced from 5s to 10s
    return () => clearInterval(interval);
  }, []);

  const getVulnCount = (scanId) =>
    vulnerabilities.filter((v) => v.scan_id === scanId).length;

  const handleManageAction = async (action, scanId) => {
    const token = localStorage.getItem('token');
    
    try {
      if (action === 'delete') {
        const res = await fetch(`${API_URL}/api/scans/${scanId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setActiveScans(prev => prev.filter(s => s.id !== scanId));
        }
      } else if (action === 'pause') {
        const res = await fetch(`${API_URL}/api/scans/${scanId}/pause`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setActiveScans(prev => prev.map(s => 
            s.id === scanId ? { ...s, status: 'Paused' } : s
          ));
        }
      } else if (action === 'resume') {
        const res = await fetch(`${API_URL}/api/scans/${scanId}/resume`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setActiveScans(prev => prev.map(s => 
            s.id === scanId ? { ...s, status: 'Running' } : s
          ));
        }
      } else if (action === 'stop') {
        const res = await fetch(`${API_URL}/api/scans/${scanId}/stop`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setActiveScans(prev => prev.map(s => 
            s.id === scanId ? { ...s, status: 'Stopped', progress: 0 } : s
          ));
        }
      } else if (action === 'rerun') {
        const res = await fetch(`${API_URL}/api/scans/${scanId}/rerun`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const newScan = await res.json();
          window.location.reload(); // Refresh to show new scan
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} scan:`, error);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <DashboardHeader role="scanmanagement" />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12 md:h-14 bg-[#e6eef5] p-1 rounded-lg">
          <TabsTrigger
            value="active"
            className="h-full text-sm md:text-lg font-semibold px-3 md:px-6 rounded-md
             data-[state=active]:bg-[#003366]
             data-[state=active]:text-white
             transition"
          >
            Active Scans
          </TabsTrigger>

          <TabsTrigger
            value="vulnerabilities"
            className="h-full text-sm md:text-lg font-semibold px-3 md:px-6 rounded-md
             data-[state=active]:bg-[#003366]
             data-[state=active]:text-white
             transition"
          >
            Vulnerabilities
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Active Scans ---------------- */}
        <TabsContent value="active" className="mt-4 md:mt-6 space-y-4 md:space-y-6 w-full">
          {activeScans.map((scan) => (
            <Card key={scan.id} className="w-full overflow-hidden">
              <CardHeader className="border-0 min-h-auto py-3 md:py-5">
                <CardTitle className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm font-semibold text-foreground truncate">{scan.name}</span>
                </CardTitle>
                <CardToolbar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="dim" size="sm" mode="icon" className="-me-1.5">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/scan_management/${scan.id}`)}>
                        <Eye className="w-4 h-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('pause', scan.id)}>
                        <Pause className="w-4 h-4" />
                        Pause Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('resume', scan.id)}>
                        <Play className="w-4 h-4" />
                        Resume Scan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleManageAction('stop', scan.id)}>
                        <StopCircle className="w-4 h-4" />
                        Stop Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('rerun', scan.id)}>
                        <RotateCcw className="w-4 h-4" />
                        Re-run Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('delete', scan.id)}>
                        <Trash className="w-4 h-4" />
                        Delete Scan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardToolbar>
              </CardHeader>
              <CardContent className="space-y-2.5 overflow-hidden">
                {/* Progress bar - responsive */}
                <div className="hidden md:flex w-full gap-1 overflow-hidden">
                  {[...Array(100)].map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block w-3 h-4 rounded-sm border transition-colors flex-shrink-0 ${
                        i < scan.progress ? 'bg-green-500 border-green-500' : 'bg-muted border-muted'
                      }`}
                    />
                  ))}
                </div>
                {/* Mobile progress bar - fewer blocks */}
                <div className="flex md:hidden w-full gap-0.5 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block flex-1 h-4 rounded-sm border transition-colors ${
                        i < (scan.progress / 5) ? 'bg-green-500 border-green-500' : 'bg-muted border-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-muted-foreground mt-1 w-full">
                  <span className="truncate max-w-full">{scan.target}</span>
                  <div className="flex flex-col items-start md:items-end flex-shrink-0">
                    <span className="font-semibold text-foreground whitespace-nowrap">{Math.round(scan.progress)}% complete</span>
                    {scan.message && <span className="text-xs text-muted-foreground truncate max-w-full">{scan.message}</span>}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs w-full">
                  <span className="text-muted-foreground truncate">Started: {scan.started}</span>
                  <Badge variant="destructive" className="self-start md:self-auto flex-shrink-0">{scan.issues} vulnerabilities</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ---------------- Vulnerabilities ---------------- */}
        <TabsContent value="vulnerabilities" className="mt-4 md:mt-6 space-y-4 w-full">
          {vulnerabilities.map((vuln) => (
            <Card
              key={vuln.id}
              onClick={() =>
                router.push(`/dashboard/admin/scan_management/${vuln.scan_id}`)
              }
              className="cursor-pointer hover:shadow-lg transition-shadow w-full overflow-hidden"
            >
              <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm md:text-base truncate">{vuln.title}</CardTitle>
                  <CardDescription className="text-xs md:text-sm truncate">Scan #{vuln.scan_id} - {vuln.target}</CardDescription>
                </div>
                <Badge variant="destructive" className="self-start flex-shrink-0">{vuln.severity}</Badge>
              </CardHeader>
            </Card>
          ))}
          {vulnerabilities.length === 0 && (
            <Card className="w-full"><CardHeader><CardTitle className="text-sm md:text-base">No vulnerabilities found</CardTitle></CardHeader></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
