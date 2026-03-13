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
    <div className="space-y-4 w-full">
      <DashboardHeader role="reports" />

      {/* ---------------- Summary Cards ---------------- */}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Total Reports</CardTitle>
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">38</div>
            <p className="text-xs md:text-sm text-muted-foreground">Generated this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Critical Reports</CardTitle>
            <Badge variant="destructive" className="text-xs">High Risk</Badge>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">7</div>
            <p className="text-xs md:text-sm text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">12</div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Automated recurring reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Generated Reports</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Download your security reports
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ReportsDownload />
        </CardContent>
      </Card>
    </div>
  );
}
