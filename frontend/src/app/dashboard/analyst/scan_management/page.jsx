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
        <TabsContent value="active" className="mt-6 space-y-6">
          {activeScans.map((scan) => (
            <Card
              key={scan.id}
              className="transition-all duration-300 hover:bg-blue-50 hover:border-[#003366] hover:shadow-lg border border-transparent"
            >
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[#003366]">
                    <ShieldCheck className="h-5 w-5 text-[#003366]" />
                    {scan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {scan.target}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    scan.status === "Running"
                      ? "text-green-600 border-green-600"
                      : scan.status === "Queued"
                        ? "text-yellow-600 border-yellow-600"
                        : "text-blue-600 border-blue-600"
                  }`}
                >
                  {scan.status}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <Progress
                  value={scan.progress}
                  className="bg-gray-300 [&>div]:bg-[#003366]"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-[#003366] font-medium">
                    Progress: {scan.progress}%
                  </span>

                  <span className="text-gray-500">Started: {scan.started}</span>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="font-medium text-[#003366]">
                    Active Scan #{scan.id}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="flex items-center gap-1 text-gray-700">
                    Generated
                    <Badge variant="destructive">{getVulnCount(scan.id)}</Badge>
                    <span className="font-medium text-[#003366]">
                      vulnerabilities
                    </span>
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
                    className={"hover:bg-amber-500"}
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
                        className="data-[highlighted]:bg-yellow-600 data-[highlighted]:text-white"
                      >
                        Pause Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("resume", scan.id)}
                        className="data-[highlighted]:bg-green-600 data-[highlighted]:text-white"
                      >
                        Resume Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("stop", scan.id)}
                        className="data-[highlighted]:bg-red-600 data-[highlighted]:text-white"
                      >
                        Stop Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("rerun", scan.id)}
                        className="data-[highlighted]:bg-[#003366] data-[highlighted]:text-white"
                      >
                        Re-run Scan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleManageAction("delete", scan.id)}
                        className="text-red-600 data-[highlighted]:bg-red-600 data-[highlighted]:text-white"
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
