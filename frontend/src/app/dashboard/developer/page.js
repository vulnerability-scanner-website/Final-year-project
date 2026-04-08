"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Globe, Server, Network, ShieldCheck, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import { CardStack } from "@/components/ui/card-stack";
import NewScanDialog from "@/components/popup/NewScanDialog";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { DashboardHeader } from "@/components/header/header";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const ScanItem = ({ icon, title, status, progress, issues, date }) => (
  <div className="mb-4 flex items-center gap-4 last:mb-0">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between">
        <p className="font-medium text-white truncate">{title}</p>
        <p className="text-sm font-semibold text-yellow-400 shrink-0 ml-2">{progress}%</p>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-white/40">
        <span>{issues} vulnerabilities</span>
        {date && <span>{date}</span>}
        <span className={`px-2 py-0.5 rounded-full ${
          status === "Completed" ? "bg-green-500/10 text-green-400" :
          status === "Running"   ? "bg-yellow-500/10 text-yellow-400" :
          status === "Failed"    ? "bg-red-500/10 text-red-400" :
          "bg-white/5 text-white/40"
        }`}>{status}</span>
      </div>
    </div>
  </div>
);

export default function Page() {
  const [recentScans, setRecentScans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [stats, setStats] = useState({ totalScans: 0, inProgress: 0, completed: 0, totalIssues: 0 });

  const fetchScans = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/scans`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setRecentScans(list.slice(0, 3));
      setStats({
        totalScans: list.length,
        inProgress: list.filter(s => s.status === "Running").length,
        completed: list.filter(s => s.status === "Completed").length,
        totalIssues: list.reduce((sum, s) => sum + (s.issues || 0), 0),
      });
    } catch {}
  }, []);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  return (
    <div className="space-y-6 min-h-screen bg-[#101010] text-white">
      <DashboardHeader role="developer" onActionClick={() => setOpenDialog(true)} />

      <div className="space-y-6 px-1">
        <SubscriptionBanner role="developer" />

        {/* Stats */}
        <div className="w-full overflow-hidden">
          <div className="mx-auto w-full max-w-md">
            <CardStack
              items={[
                { id: 1, title: "My Scans",     description: `${stats.totalScans} Total security scans`,       imageSrc: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80", href: "#" },
                { id: 2, title: "In Progress",  description: `${stats.inProgress} Scans currently running`,    imageSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", href: "#" },
                { id: 3, title: "Completed",    description: `${stats.completed} Successfully finished scans`, imageSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80", href: "#" },
                { id: 4, title: "Total Issues", description: `${stats.totalIssues} Vulnerabilities detected`,  imageSrc: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80", href: "#" },
              ]}
              initialIndex={0} cardWidth={400} cardHeight={280} autoAdvance intervalMs={2000} pauseOnHover showDots
            />
          </div>
        </div>

        {/* Recent Scans */}
        <FeatureCard title="My Recent Scans" description="Overview of your latest security scans" className="bg-[#1a1a1a] border-white/10 text-white">
          <div className="flex flex-col space-y-4">
            {recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <ScanItem
                  key={scan.id}
                  icon={<Globe className="h-6 w-6 text-yellow-400" />}
                  title={scan.target}
                  progress={scan.status === "Completed" ? 100 : scan.status === "Running" ? 50 : 0}
                  issues={scan.issues || 0}
                  status={scan.status}
                  date={new Date(scan.created_at).toLocaleDateString()}
                />
              ))
            ) : (
              <>
                <ScanItem icon={<Globe className="h-6 w-6 text-yellow-400" />}   title="Website Security Scan"  progress={63}  issues={25} status="In Progress" />
                <ScanItem icon={<Server className="h-6 w-6 text-orange-400" />}  title="API Vulnerability Test"  progress={63}  issues={35} status="Scanning" />
                <ScanItem icon={<Network className="h-6 w-6 text-white/50" />}   title="Network Security Audit"  progress={100} issues={42} status="Completed" date="2 days ago" />
              </>
            )}
          </div>
        </FeatureCard>
      </div>

      <NewScanDialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) fetchScans(); }} role="developer" />
    </div>
  );
}
