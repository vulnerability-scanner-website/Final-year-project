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


/* ---------------- Mock Data ---------------- */

const activeScans = [
  {
    id: 1,
    name: "Full Website Scan",
    target: "https://example.com",
    status: "Running",
    progress: 65,
    started: "10 mins ago",
  },
  {
    id: 2,
    name: "API Security Scan",
    target: "https://api.example.com",
    status: "Queued",
    progress: 20,
    started: "2 mins ago",
  },
  {
    id: 3,
    name: "Authentication Scan",
    target: "https://example.com/login",
    status: "Completed",
    progress: 100,
    started: "1 hour ago",
  },
];

const vulnerabilities = [
  {
    id: 1,
    scanId: 1,
    severity: "Critical",
    title: "SQL Injection",
  },
  {
    id: 2,
    scanId: 1,
    severity: "High",
    title: "Stored XSS",
  },
  {
    id: 3,
    scanId: 2,
    severity: "Medium",
    title: "Open Redirect",
  },
];

/* ---------------- Helpers ---------------- */

const getVulnCount = (scanId) =>
  vulnerabilities.filter((v) => v.scanId === scanId).length;

/* ---------------- Component ---------------- */

export default function ScanManagement() {
  const router = useRouter();
  const [activeScans, setActiveScans] = useState([]);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = () => {
    const scans = JSON.parse(localStorage.getItem('scans') || '[]');
    if (scans.length > 0) {
      setActiveScans(scans);
    } else {
      setActiveScans([
        {
          id: 1,
          name: "Full Website Scan",
          target: "https://example.com",
          status: "Running",
          progress: 65,
          started: "10 mins ago",
        },
        {
          id: 2,
          name: "API Security Scan",
          target: "https://api.example.com",
          status: "Queued",
          progress: 20,
          started: "2 mins ago",
        },
        {
          id: 3,
          name: "Authentication Scan",
          target: "https://example.com/login",
          status: "Completed",
          progress: 100,
          started: "1 hour ago",
        },
      ]);
    }
  };

  const handleManageAction = (action, scanId) => {
    console.log(`Action: ${action} on scan ${scanId}`);
    // connect to API later
  };

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white">
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-[#1a1a1a] border border-white/10 p-1 rounded-lg">
            <TabsTrigger value="active" className="h-full text-sm font-semibold px-6 rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
              Active Scans
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="h-full text-sm font-semibold px-6 rounded-md text-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:font-bold transition">
              Vulnerabilities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6 space-y-4">
            {activeScans.map((scan) => (
              <div key={scan.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-white">{scan.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" className="bg-[#1a1a1a] border border-white/10 text-white">
                      <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer" onClick={() => router.push(`/dashboard/analyst/scan_management/${scan.id}`)}><Eye className="w-4 h-4" />View Details</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer" onClick={() => handleManageAction('pause', scan.id)}><Pause className="w-4 h-4" />Pause Scan</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-yellow-500/10 hover:text-yellow-400 cursor-pointer" onClick={() => handleManageAction('resume', scan.id)}><Play className="w-4 h-4" />Resume Scan</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer" onClick={() => handleManageAction('stop', scan.id)}><StopCircle className="w-4 h-4" />Stop Scan</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer" onClick={() => handleManageAction('rerun', scan.id)}><RotateCcw className="w-4 h-4" />Re-run Scan</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-red-500/10 hover:text-red-400 cursor-pointer" onClick={() => handleManageAction('delete', scan.id)}><Trash className="w-4 h-4" />Delete Scan</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex w-full gap-0.5 overflow-hidden mb-2">
                  {[...Array(100)].map((_, i) => (
                    <span key={i} className={`inline-block w-3 h-4 rounded-sm border flex-shrink-0 transition-colors ${
                      i < scan.progress ? 'bg-yellow-500 border-yellow-500' : 'bg-white/5 border-white/10'
                    }`} />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{scan.target}</span>
                  <span className="font-semibold text-yellow-400">{scan.progress}% complete</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-white/40">Started: {scan.started}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">{getVulnCount(scan.id)} vulnerabilities</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="vulnerabilities" className="mt-6 space-y-4">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} onClick={() => router.push(`/dashboard/analyst/scan_management/${vuln.scanId}`)}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-yellow-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-red-400" />
                      <span className="font-semibold text-white">{vuln.title}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Scan #{vuln.scanId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    vuln.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    vuln.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    vuln.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-white/5 text-white/50 border border-white/10'
                  }`}>{vuln.severity}</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
    </div>
  );
}
