"use client";

import { useState } from "react";
import { Plus, Shield, Search, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import TrackingTimeline from "@/components/ui/order-history";
import ViewScanDialog from "@/components/popup/ViewScanDialog";

const scan1History = [
  { id: 1, status: "completed", title: "Scan Initiated", date: "15 Jan 2024, 08:45", icon: <Search className="h-4 w-4 text-white" /> },
  { id: 2, status: "completed", title: "Vulnerability Assessment", date: "15 Jan 2024, 08:47", icon: <Shield className="h-4 w-4 text-white" /> },
  { id: 3, status: "completed", title: "Security Analysis Complete", date: "15 Jan 2024, 08:52", icon: <CheckCircle className="h-4 w-4 text-white" /> },
];

const scan2History = [
  { id: 4, status: "completed", title: "Scan Initiated", date: "15 Jan 2024, 09:15", icon: <Search className="h-4 w-4 text-white" /> },
  { id: 5, status: "in-progress", title: "Vulnerability Assessment", date: "In Progress", icon: <Clock className="h-4 w-4 text-yellow-400" /> },
  { id: 6, status: "pending", title: "Security Analysis", date: "Pending", icon: <ShieldCheck className="h-4 w-4 text-white/30" /> },
];

export default function SecurityFindingsPage() {
  const [selectedScan, setSelectedScan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Findings</h1>
          <p className="text-white/40">View and track your security scan findings</p>
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="h-4 w-4" />
          New Scan
        </button>
      </div>

      {/* Scan History Timelines */}
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">mywebsite.com — Scan Complete</h3>
          <p className="text-sm text-white/40 mb-6">Security scan completed successfully</p>
          <TrackingTimeline items={scan1History} className="border-white/10" />
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">api.mywebsite.com — Scan In Progress</h3>
          <p className="text-sm text-white/40 mb-6">Security scan currently running</p>
          <TrackingTimeline items={scan2History} className="border-white/10" />
        </div>
      </div>

      <ViewScanDialog open={openDialog} onOpenChange={setOpenDialog} scan={selectedScan} />
    </div>
  );
}
