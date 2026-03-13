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
    <div className="space-y-4 md:space-y-6 ">
      <DashboardHeader role={"admin"} />
      
      {/* Stats Cards Section */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
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
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 w-full">
        <VulnerabilityTrend />
        <SeverityDistribution />
      </div>

      {/* Quick Action Cards for Admin */}
      <div className="">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
          Quick Actions
        </h3>
        
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {/* User Management Card */}
          <div className="group bg-white rounded-xl shadow-lg p-4 md:p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 hover:-translate-y-1 cursor-pointer w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap">12 new</span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">User Management</h4>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Manage users, roles & permissions</p>
            <div className="mt-3 flex items-center text-blue-600 text-xs md:text-sm font-medium">
              <span>View users</span>
              <Users className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* System Settings Card */}
          <div className="group bg-white rounded-xl shadow-lg p-4 md:p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500 hover:-translate-y-1 cursor-pointer w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap">Pending</span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">System Settings</h4>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Configure scan parameters & rules</p>
            <div className="mt-3 flex items-center text-orange-600 text-xs md:text-sm font-medium">
              <span>Configure</span>
              <Settings className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Report Generation Card */}
          <div className="group bg-white rounded-xl shadow-lg p-4 md:p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 hover:-translate-y-1 cursor-pointer w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full whitespace-nowrap">Weekly</span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">Generate Reports</h4>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Create compliance & audit reports</p>
            <div className="mt-3 flex items-center text-green-600 text-xs md:text-sm font-medium">
              <span>Download</span>
              <Download className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}