"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DashboardHeader } from "@/components/header/header";
import { ShieldAlert, Bug, CheckCircle, Activity } from "lucide-react";
import { StatsCard } from "@/components/statscard/statscard";
import { VulnerabilityTrend } from "@/components/VulnerabilityTrend/VulnerabilityTrend";
import { SeverityDistribution } from "@/components/SeverityDistribution/SeverityDistribution";

export default function Page() {
  return (
    <div className="ml-64 p-5 space-y-4">
      {" "}
      {/* Added ml-64 to avoid sidebar overlap */}
      <DashboardHeader role={"admin"} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-6">
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
      <div className="grid gap-6 lg:grid-cols-2 p-6">
        <VulnerabilityTrend />
        <SeverityDistribution />
      </div>
    </div>
  );
}
