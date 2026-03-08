"use client";

import { useState } from "react";
import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";
import { Plus, Shield, Search, AlertTriangle, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrackingTimeline, { TimelineItem } from "@/components/ui/order-history";
import ViewScanDialog from "@/components/popup/ViewScanDialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const scan1History = [
  {
    id: 1,
    status: "completed",
    title: "Scan Initiated",
    date: "15 Jan 2024, 08:45",
    icon: <Search className="h-4 w-4 text-white" />,
  },
  {
    id: 2,
    status: "completed",
    title: "Vulnerability Assessment",
    date: "15 Jan 2024, 08:47",
    icon: <Shield className="h-4 w-4 text-white" />,
  },
  {
    id: 3,
    status: "completed",
    title: "Security Analysis Complete",
    date: "15 Jan 2024, 08:52",
    icon: <CheckCircle className="h-4 w-4 text-white" />,
  },
];

const scan2History = [
  {
    id: 4,
    status: "completed",
    title: "Scan Initiated",
    date: "15 Jan 2024, 09:15",
    icon: <Search className="h-4 w-4 text-white" />,
  },
  {
    id: 5,
    status: "in-progress",
    title: "Vulnerability Assessment",
    date: "In Progress",
    icon: <Clock className="h-4 w-4 text-primary" />,
  },
  {
    id: 6,
    status: "pending",
    title: "Security Analysis",
    date: "Pending",
    icon: <ShieldCheck className="h-4 w-4 text-muted-foreground/50" />,
  },
];

const scanData = [
  {
    id: 1,
    target: "mywebsite.com",
    status: "Completed",
    issues: 2,
    date: "2024-01-15",
    duration: "2m 34s",
    vulnerabilities: [
      {
        id: 1,
        title: "SQL Injection",
        severity: "High",
        description: "Unsanitized input detected in login form.",
        fix: "Use parameterized queries and validate inputs.",
      },
      {
        id: 2,
        title: "Cross-Site Scripting (XSS)",
        severity: "Medium",
        description: "Reflected user input found in search field.",
        fix: "Escape and sanitize all user input.",
      },
    ],
  },
  {
    id: 2,
    target: "api.mywebsite.com",
    status: "Running",
    issues: 0,
    date: "2024-01-15",
    duration: "1m 12s",
    vulnerabilities: [],
  },
];

export default function ScanManagementPage() {
  const [selectedScan, setSelectedScan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex">
      <DeveloperSideBar />

      <main className="flex-1 ml-64 p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Scans</h1>
            <p className="text-muted-foreground">
              View and manage your security scans
            </p>
          </div>

          <Button className="bg-sky-600 hover:bg-sky-700 shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </div>

        {/* Scan History Timeline */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">mywebsite.com - Scan Complete</CardTitle>
              <CardDescription>
                Security scan completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10">
              <TrackingTimeline items={scan1History} />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">api.mywebsite.com - Scan In Progress</CardTitle>
              <CardDescription>
                Security scan currently running
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10">
              <TrackingTimeline items={scan2History} />
            </CardContent>
          </Card>
        </div>

        {/* Popup Dialog */}
        <ViewScanDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          scan={selectedScan}
        />
      </main>
    </div>
  );
}
