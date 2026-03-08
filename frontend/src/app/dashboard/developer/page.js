"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle, AlertCircle, Plus, Globe, Server, Network } from "lucide-react";
import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";
import { CardStack } from "@/components/ui/card-stack";
import { FeatureCard } from "@/components/ui/feature-card";
import NewScanDialog from "@/components/popup/NewScanDialog";

const ScanItem = ({
  icon,
  title,
  status,
  progress,
  issues,
  total,
  date,
}) => (
  <div className="mb-4 flex items-center gap-4 last:mb-0">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between">
        <p className="font-medium text-card-foreground">{title}</p>
        <p className="text-sm font-semibold text-card-foreground">{progress}%</p>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{issues} of {total} issues</span>
        {date && <span>{date}</span>}
        <span>{status}</span>
      </div>
    </div>
  </div>
);

export default function Page() {
  const [recentScans, setRecentScans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 23,
    inProgress: 3,
    completed: 18,
    totalIssues: 45
  });

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = () => {
    const scans = JSON.parse(localStorage.getItem('scans') || '[]');
    const recent = scans.slice(-3).reverse();
    setRecentScans(recent);
    
    // Update stats based on actual scan data
    const running = scans.filter(s => s.status === 'Running').length;
    const completed = scans.filter(s => s.status === 'Completed').length;
    const scansWithProgress = scans.filter(s => (s.progress || 0) > 0).length;
    
    setStats({
      totalScans: scans.length,
      inProgress: running,
      completed: completed,
      totalIssues: scansWithProgress * 5
    });
  };

  return (
    <>
      <DeveloperSideBar />
      <div className="ml-64 p-6 space-y-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your security scans and vulnerabilities
            </p>
          </div>

          <Button className="gap-2" onClick={() => setOpenDialog(true)}>
            <Plus size={16} />
            New Scan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="w-full overflow-hidden">
          <div className="mx-auto w-full max-w-md">
            <CardStack
              items={[
                {
                  id: 1,
                  title: "My Scans",
                  description: `${stats.totalScans} Total security scans`,
                  imageSrc: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
                  href: "#",
                },
                {
                  id: 2,
                  title: "In Progress",
                  description: `${stats.inProgress} Scans currently running`,
                  imageSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
                  href: "#",
                },
                {
                  id: 3,
                  title: "Completed",
                  description: `${stats.completed} Successfully finished scans`,
                  imageSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
                  href: "#",
                },
                {
                  id: 4,
                  title: "Total Issues",
                  description: `${stats.totalIssues} Vulnerabilities detected`,
                  imageSrc: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80",
                  href: "#",
                },
              ]}
              initialIndex={0}
              cardWidth={450}
              cardHeight={300}
              autoAdvance
              intervalMs={2000}
              pauseOnHover
              showDots
            />
          </div>
        </div>

        {/* Recent Scans */}
        <FeatureCard
          title="My Recent Scans"
          description="Overview of your latest security scans and their progress"
        >
          <div className="flex flex-col space-y-4">
            {recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <ScanItem
                  key={scan.id}
                  icon={<Globe className="h-6 w-6 text-primary" />}
                  title={scan.name}
                  progress={scan.progress || 0}
                  issues={0}
                  total={0}
                  status={scan.status}
                  date={scan.started}
                />
              ))
            ) : (
              <>
                <ScanItem
                  icon={<Globe className="h-6 w-6 text-primary" />}
                  title="Website Security Scan"
                  progress={63}
                  issues={25}
                  total={40}
                  status="In Progress"
                />
                <ScanItem
                  icon={<Server className="h-6 w-6 text-primary" />}
                  title="API Vulnerability Test"
                  progress={63}
                  issues={35}
                  total={45}
                  status="Scanning"
                />
                <ScanItem
                  icon={<Network className="h-6 w-6 text-primary" />}
                  title="Network Security Audit"
                  progress={100}
                  issues={42}
                  total={42}
                  status="Completed"
                  date="2 days ago"
                />
              </>
            )}
          </div>
        </FeatureCard>
        <NewScanDialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) { setTimeout(loadScans, 100); } }} />
      </div>
    </>
  );
}
