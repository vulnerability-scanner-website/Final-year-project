"use client";

import React from "react";
import ReportsDownload from "@/components/ui/download-toast";
import { FileText, Calendar, AlertTriangle } from "lucide-react";

const statCards = [
  { label: "Total Reports",     value: "38", sub: "Generated this year",        icon: FileText,      color: "yellow" },
  { label: "Critical Reports",  value: "7",  sub: "Requires review",            icon: AlertTriangle, color: "red"    },
  { label: "Scheduled Reports", value: "12", sub: "Automated recurring reports", icon: Calendar,      color: "orange" },
];

const colorMap = {
  yellow: { icon: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  red:    { icon: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
  orange: { icon: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

export default function ReportPage() {
  return (
    <div className="w-full min-h-screen bg-[#101010] text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-white/40">View and manage your generated security reports</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition text-sm">
          Generate New Report
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => {
          const c = colorMap[color];
          return (
            <div key={label} className={`bg-[#1a1a1a] border ${c.border} rounded-xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/50">{label}</p>
                <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.icon}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${c.icon}`}>{value}</p>
              <p className="text-xs text-white/40 mt-1">{sub}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Generated Reports</h3>
        <p className="text-sm text-white/40 mb-4">Download your security reports</p>
        <ReportsDownload />
      </div>
    </div>
  );
}
