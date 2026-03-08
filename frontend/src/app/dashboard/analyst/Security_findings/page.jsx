"use client";

import { useState } from "react";
import { Plus, Shield, Search, AlertTriangle, CheckCircle, Clock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrackingTimeline, { TimelineItem } from "@/components/ui/order-history";

import ViewScanDialog from "@/components/popup/ViewScanDialog";
import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ScanManagementPage() {

  /* ---------------- State ---------------- */

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

  const [scans, setScans] = useState([
    {
      id: 1,
      target: "mywebsite.com",
      status: "Completed",
      issues: 2,
      date: "2024-01-15",
      duration: "2m 34s",
    },
    {
      id: 2,
      target: "api.mywebsite.com",
      status: "Running",
      issues: 0,
      date: "2024-01-15",
      duration: "1m 12s",
    },
  ]);

  const [selectedScan, setSelectedScan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [newScanOpen, setNewScanOpen] = useState(false);
  const [url, setUrl] = useState("");

  /* ---------------- Start Scan ---------------- */

  const handleStartScan = () => {
    if (!url) return;

    const newScan = {
      id: scans.length + 1,
      target: url,
      status: "Running",
      issues: 0,
      date: new Date().toISOString().split("T")[0],
      duration: "-",
    };

    setScans([newScan, ...scans]);
    setUrl("");
    setNewScanOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <AnalystSideBar />

      {/* Main */}
      <main className="flex-1 ml-64 p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Scans</h1>
            <p className="text-muted-foreground">
              View and manage your security scans
            </p>
          </div>

          <Button
            onClick={() => setNewScanOpen(true)}
            className="bg-[#003366] hover:bg-yellow-700 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </div>

        {/* Scan History Timeline */}
        <div className="space-y-6 mt-6">
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle>mywebsite.com - Scan Complete</CardTitle>
              <CardDescription>
                Security scan completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrackingTimeline items={scan1History} />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle>api.mywebsite.com - Scan In Progress</CardTitle>
              <CardDescription>
                Security scan currently running
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrackingTimeline items={scan2History} />
            </CardContent>
          </Card>
        </div>

        {/* View Scan Dialog */}
        <ViewScanDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          scan={selectedScan}
        />

        {/* New Scan Dialog */}
        <Dialog open={newScanOpen} onOpenChange={setNewScanOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Scan</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Enter target URL (example: https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <Button
                onClick={handleStartScan}
                className="w-full bg-[#003366] hover:bg-[#00264d]"
              >
                Start Scan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}