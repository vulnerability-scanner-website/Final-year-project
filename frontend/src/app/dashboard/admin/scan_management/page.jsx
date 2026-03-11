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

export default function ScanManagement() {
  const router = useRouter();
  const [activeScans, setActiveScans] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch scans
        const scansRes = await fetch('http://localhost:5000/api/scans', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (scansRes.ok) {
          const scans = await scansRes.json();
          const formattedScans = scans.map(scan => ({
            id: scan.id,
            name: `Scan #${scan.id}`,
            target: scan.target,
            status: scan.status,
            progress: scan.status === 'Completed' ? 100 : scan.status === 'Running' ? 50 : 0,
            started: new Date(scan.created_at).toLocaleString(),
            issues: scan.issues || 0
          }));
          setActiveScans(formattedScans);
        }
        
        // Fetch vulnerabilities
        const vulnRes = await fetch('http://localhost:5000/api/vulnerabilities', {
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getVulnCount = (scanId) =>
    vulnerabilities.filter((v) => v.scan_id === scanId).length;

  return (
    <div className="ml-64 p-5 space-y-4">
      {/* Header */}
      <DashboardHeader role="scanmanagement" />

      <Tabs defaultValue="active">
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 max-w-md h-14 bg-[#e6eef5] p-1 rounded-lg">
            <TabsTrigger
              value="active"
              className="h-full text-lg font-semibold px-6 rounded-md
               data-[state=active]:bg-[#003366]
               data-[state=active]:text-white
               transition"
            >
              Active Scans
            </TabsTrigger>

            <TabsTrigger
              value="vulnerabilities"
              className="h-full text-lg font-semibold px-6 rounded-md
               data-[state=active]:bg-[#003366]
               data-[state=active]:text-white
               transition"
            >
              Vulnerabilities
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ---------------- Active Scans ---------------- */}
        <TabsContent value="active" className="mt-6 space-y-6">
          {activeScans.map((scan) => (
            <Card key={scan.id} className="w-full max-w-5xl">
              <CardHeader className="border-0 min-h-auto py-5">
                <CardTitle className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{scan.name}</span>
                </CardTitle>
                <CardToolbar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="dim" size="sm" mode="icon" className="-me-1.5">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/scan_management/${scan.id}`)}>
                        <Eye />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('pause', scan.id)}>
                        <Pause />
                        Pause Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('resume', scan.id)}>
                        <Play />
                        Resume Scan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleManageAction('stop', scan.id)}>
                        <StopCircle />
                        Stop Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('rerun', scan.id)}>
                        <RotateCcw />
                        Re-run Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAction('delete', scan.id)}>
                        <Trash />
                        Delete Scan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardToolbar>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex grow gap-1">
                  {[...Array(100)].map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block w-3 h-4 rounded-sm border transition-colors ${
                        i < scan.progress ? 'bg-primary border-primary' : 'bg-muted border-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{scan.target}</span>
                  <span className="font-semibold text-foreground">{scan.progress}% complete</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Started: {scan.started}</span>
                  <Badge variant="destructive">{scan.issues} vulnerabilities</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ---------------- Vulnerabilities ---------------- */}
        <TabsContent value="vulnerabilities" className="mt-6 space-y-4">
          {vulnerabilities.map((vuln) => (
            <Card
              key={vuln.id}
              onClick={() =>
                router.push(`/dashboard/admin/scan_management/${vuln.scan_id}`)
              }
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>{vuln.title}</CardTitle>
                  <CardDescription>Scan #{vuln.scan_id} - {vuln.target}</CardDescription>
                </div>
                <Badge variant="destructive">{vuln.severity}</Badge>
              </CardHeader>
            </Card>
          ))}
          {vulnerabilities.length === 0 && (
            <Card><CardHeader><CardTitle>No vulnerabilities found</CardTitle></CardHeader></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
