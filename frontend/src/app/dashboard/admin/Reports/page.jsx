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
    <div className="ml-64 p-6 space-y-6">
      <DashboardHeader role="reports" />

      {/* ---------------- Summary Cards ---------------- */}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Reports</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-sm text-muted-foreground">Generated this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Critical Reports</CardTitle>
            <Badge variant="destructive">High Risk</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-sm text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scheduled Reports</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">
              Automated recurring reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            Download your security reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsDownload />
        </CardContent>
      </Card>
    </div>
  );
}
