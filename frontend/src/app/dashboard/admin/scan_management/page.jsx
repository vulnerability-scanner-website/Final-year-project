"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck, Bug } from "lucide-react";
import { DashboardHeader } from "@/components/header/header";
import { bg } from "date-fns/locale";

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

  const handleManageAction = (action, scanId) => {
    console.log(`Action: ${action} on scan ${scanId}`);
    // connect to API later
  };

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
        <TabsContent value="active" className="mt-6 space-y-4">
          {activeScans.map((scan) => (
            <Card key={scan.id}>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                    {scan.name}
                  </CardTitle>
                  <CardDescription>{scan.target}</CardDescription>
                </div>
                <Badge variant="outline">{scan.status}</Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <Progress
                  value={scan.progress}
                  className="bg-gray-300 [&>div]:bg-[#003366]"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress: {scan.progress}%</span>
                  <span>Started: {scan.started}</span>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="font-medium">Active Scan #{scan.id}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="flex items-center gap-1">
                    Generated
                    <Badge variant="destructive">{getVulnCount(scan.id)}</Badge>
                    vulnerabilities
                  </span>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  {/* View Details Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/admin/scan_management/${scan.id}`)
                    }
                  >
                    View Details
                  </Button>

                  {/* Manage Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className={"bg-[#003366]"}>
                        Manage
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleManageAction("pause", scan.id)}
                      >
                        Pause Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("resume", scan.id)}
                      >
                        Resume Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("stop", scan.id)}
                      >
                        Stop Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("rerun", scan.id)}
                      >
                        Re-run Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleManageAction("delete", scan.id)}
                      >
                        Delete Scan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                router.push(`/admin/scan_management/${vuln.scanId}`)
              }
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>{vuln.title}</CardTitle>
                  <CardDescription>Scan #{vuln.scanId}</CardDescription>
                </div>
                <Badge variant="destructive">{vuln.severity}</Badge>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
