"use client";

import React from "react";
import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { FileText, Download, Calendar } from "lucide-react";

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

export default function ReportPage() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <DeveloperSideBar />

      {/* Main Content */}
      <main className="flex-1  p-8 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports Dashboard</h1>
            <p className="text-muted-foreground">
              View and manage your generated security reports
            </p>
          </div>
          <div>
            <Button className="bg-[#003366] hover:bg-[#00264d] cursor-pointer">
              Generate New Report
            </Button>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Total Reports</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-sm text-muted-foreground">
                Generated this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Critical Reports</CardTitle>
              <Badge variant="destructive">High Risk</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-sm text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
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

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
            <CardDescription>
              Narrow down reports by type or date
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Search reports..." />

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-[#003366] hover:bg-[#00264d]">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>
              View and download past security reports
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.generated}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "Completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
