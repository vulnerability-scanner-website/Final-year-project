"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DashboardHeader } from "@/components/header/header";
import {
  ShieldAlert,
  Bug,
  CheckCircle,
  Activity,
  Users,
  Settings,
  FileText,
  Download,
  Zap,
} from "lucide-react";
import { StatsCard } from "@/components/statscard/statscard";
import { VulnerabilityTrend } from "@/components/VulnerabilityTrend/VulnerabilityTrend";
import { SeverityDistribution } from "@/components/SeverityDistribution/SeverityDistribution";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Page() {
  const [stats, setStats] = useState({
    totalScans: 0,
    criticalIssues: 0,
    highSeverity: 0,
    resolved: 0,
    totalUsers: 0,
    newUsers: 0,
    scanGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full bg-[#101010] min-h-screen text-white p-0">
      <DashboardHeader role={"admin"} />

      {/* Stats Cards Section - Wrapped */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full px-4">
        <StatsCard
          title="Total Scans"
          value={loading ? "..." : stats.totalScans.toString()}
          description={`${stats.scanGrowth >= 0 ? '+' : ''}${stats.scanGrowth}% from last month`}
          icon={Activity}
        />

        <StatsCard
          title="Critical Issues"
          value={loading ? "..." : stats.criticalIssues.toString()}
          description="Needs immediate attention"
          icon={ShieldAlert}
        />

        <StatsCard
          title="High Severity"
          value={loading ? "..." : stats.highSeverity.toString()}
          description="Requires review"
          icon={Bug}
        />

        <StatsCard
          title="Resolved"
          value={loading ? "..." : stats.resolved.toString()}
          description="Issues fixed successfully"
          icon={CheckCircle}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 w-full px-4">
        <VulnerabilityTrend />
        <SeverityDistribution />
      </div>

      {/* Quick Action Cards for Admin */}
      <div className="mt-6 md:mt-8 w-full px-4 pb-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          Quick Actions
        </h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
          {/* User Management Card */}
          <Link href="/dashboard/admin/Users">
            <div className="group card-default border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 border-l-4 border-l-yellow-500 hover:-translate-y-1 cursor-pointer w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="badge-warning">
                  {loading ? "..." : `${stats.newUsers} new`}
                </span>
              </div>
              <h4 className="font-semibold text-white text-sm md:text-base">
                User Management
              </h4>
              <p className="text-xs md:text-sm text-white/40 mt-1">
                Manage users, roles & permissions
              </p>
              <div className="mt-3 flex items-center text-yellow-400 text-xs md:text-sm font-medium">
                <span>View users</span>
                <Users className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* System Settings Card */}
          <Link href="/dashboard/admin/settings">
          <div className="group card-default border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 border-l-4 border-l-orange-500 hover:-translate-y-1 cursor-pointer w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
              <span className="badge-brand">
                Active
              </span>
            </div>
            <h4 className="font-semibold text-white text-sm md:text-base">
              System Settings
            </h4>
            <p className="text-xs md:text-sm text-white/40 mt-1">
              Configure scan parameters & rules
            </p>
            <div className="mt-3 flex items-center text-orange-400 text-xs md:text-sm font-medium">
              <span>Configure</span>
              <Settings className="w-4 h-4 ml-1" />
            </div>
          </div>
          </Link>

          {/* Report Generation Card */}
          <Link href="/dashboard/admin/Reports">
          <div className="group card-default hover:border-white/20 transition-all duration-300 border-l-4 border-l-white/30 hover:-translate-y-1 cursor-pointer w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <FileText className="w-5 h-5 text-white/60" />
              </div>
              <span className="text-xs bg-white/5 text-white/50 border border-white/10 px-2 py-1 rounded-full whitespace-nowrap">
                Weekly
              </span>
            </div>
            <h4 className="font-semibold text-white text-sm md:text-base">
              Generate Reports
            </h4>
            <p className="text-xs md:text-sm text-white/40 mt-1">
              Create compliance & audit reports
            </p>
            <div className="mt-3 flex items-center text-white/50 text-xs md:text-sm font-medium">
              <span>Download</span>
              <Download className="w-4 h-4 ml-1" />
            </div>
          </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
