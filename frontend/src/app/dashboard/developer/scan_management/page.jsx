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

/* ---------------- Helper ---------------- */

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
  };

  return (
    <div className="ml-64 p-5 space-y-6">
      {/* Header */}
      <DashboardHeader role="scanmanagement" />

      <Tabs defaultValue="active" className="space-y-6">
        {/* Tabs Header */}
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

        {/* ---------------- Active Scans ---------------- */}

        <TabsContent value="active" className="space-y-6">
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
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/developer/scan_management/${scan.id}`)}>
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
                  <Badge variant="destructive">{getVulnCount(scan.id)} vulnerabilities</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ---------------- Vulnerabilities ---------------- */}

        <TabsContent value="vulnerabilities" className="space-y-4">
          {/* Counter */}
          <div className="text-sm text-gray-600">
            Total Vulnerabilities
            <Badge variant="destructive" className="ml-2">
              {vulnerabilities.length}
            </Badge>
          </div>

          {vulnerabilities.map((vuln) => (
            <Card
              key={vuln.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border hover:border-red-400"
              onClick={() =>
                router.push(
                  `/dashboard/developer/scan_management/${vuln.scanId}`
                )
              }
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    {vuln.title}
                  </CardTitle>

                  <CardDescription>
                    Found in Scan #{vuln.scanId}
                  </CardDescription>
                </div>

                <Badge
                  variant={
                    vuln.severity === "Critical"
                      ? "destructive"
                      : vuln.severity === "High"
                      ? "destructive"
                      : vuln.severity === "Medium"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {vuln.severity}
                </Badge>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}