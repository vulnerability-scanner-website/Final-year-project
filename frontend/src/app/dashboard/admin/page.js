"use client";

import React from "react";
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
  Zap
} from "lucide-react";
import { StatsCard } from "@/components/statscard/statscard";
import { VulnerabilityTrend } from "@/components/VulnerabilityTrend/VulnerabilityTrend";
import { SeverityDistribution } from "@/components/SeverityDistribution/SeverityDistribution";

export default function Page() {
  return (
    <div className="ml-64 p-5 space-y-4">
      <DashboardHeader role={"admin"} />
      
      {/* Stats Cards Section - Wrapped */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value="128"
          description="+12% from last month"
          icon={Activity}
        />

        <StatsCard
          title="Critical Issues"
          value="12"
          description="Needs immediate attention"
          icon={ShieldAlert}
        />

        <StatsCard
          title="High Severity"
          value="23"
          description="Requires review"
          icon={Bug}
        />

        <StatsCard
          title="Resolved"
          value="89"
          description="Issues fixed successfully"
          icon={CheckCircle}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VulnerabilityTrend />
        <SeverityDistribution />
      </div>

      {/* Quick Action Cards for Admin */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Quick Actions
        </h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* User Management Card */}
          <div className="group bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">12 new</span>
            </div>
            <h4 className="font-semibold text-gray-800">User Management</h4>
            <p className="text-sm text-gray-600 mt-1">Manage users, roles & permissions</p>
            <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
              <span>View users</span>
              <Users className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* System Settings Card */}
          <div className="group bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Pending</span>
            </div>
            <h4 className="font-semibold text-gray-800">System Settings</h4>
            <p className="text-sm text-gray-600 mt-1">Configure scan parameters & rules</p>
            <div className="mt-3 flex items-center text-orange-600 text-sm font-medium">
              <span>Configure</span>
              <Settings className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Report Generation Card */}
          <div className="group bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Weekly</span>
            </div>
            <h4 className="font-semibold text-gray-800">Generate Reports</h4>
            <p className="text-sm text-gray-600 mt-1">Create compliance & audit reports</p>
            <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
              <span>Download</span>
              <Download className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
