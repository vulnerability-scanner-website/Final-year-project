"use client";

import React from "react";
import { DashboardHeader } from "@/components/header/header";
import ReportsDownload from "@/components/ui/download-toast";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { FileText, Calendar } from "lucide-react";

/* ---------------- Mock Data ---------------- */

const reports = [
  {
    id: 1,
    name: "Weekly Security Report",
    type: "Weekly",
    generated: "2026-02-25",
    status: "Completed",
  },
  {
    id: 2,
    name: "Critical Vulnerability Summary",
    type: "Critical",
    generated: "2026-02-24",
    status: "Completed",
  },
  {
    id: 3,
    name: "Monthly Audit Report",
    type: "Monthly",
    generated: "2026-02-01",
    status: "Processing",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#101010] text-white space-y-4 w-full">
      <DashboardHeader role="reports" />

      <div className="px-4 pb-6 space-y-4">
      {/* ---------------- Summary Cards ---------------- */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-sm text-yellow-400/70">Total Reports</p>
            <p className="text-3xl font-bold text-yellow-400">38</p>
            <p className="text-xs text-white/30 mt-1">Generated this year</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <FileText className="text-yellow-400" size={22} />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-sm text-red-400/70">Critical Reports</p>
            <p className="text-3xl font-bold text-red-400">7</p>
            <p className="text-xs text-white/30 mt-1">Requires review</p>
          </div>
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">High Risk</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-sm text-orange-400/70">Scheduled Reports</p>
            <p className="text-3xl font-bold text-orange-400">12</p>
            <p className="text-xs text-white/30 mt-1">Automated recurring reports</p>
          </div>
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <Calendar className="text-orange-400" size={22} />
          </div>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-1">Generated Reports</h3>
        <p className="text-xs text-white/40 mb-4">Download your security reports</p>
        <ReportsDownload />
      </div>
      </div>
    </div>
  );
}
