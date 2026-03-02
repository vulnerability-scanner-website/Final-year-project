"use client";

import { useState } from "react";
import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";
import { Eye, Download, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ViewScanDialog from "@/components/popup/ViewScanDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const scanData = [
  {
    id: 1,
    target: "mywebsite.com",
    status: "Completed",
    issues: 2,
    date: "2024-01-15",
    duration: "2m 34s",
    vulnerabilities: [
      {
        id: 1,
        title: "SQL Injection",
        severity: "High",
        description: "Unsanitized input detected in login form.",
        fix: "Use parameterized queries and validate inputs.",
      },
      {
        id: 2,
        title: "Cross-Site Scripting (XSS)",
        severity: "Medium",
        description: "Reflected user input found in search field.",
        fix: "Escape and sanitize all user input.",
      },
    ],
  },
  {
    id: 2,
    target: "api.mywebsite.com",
    status: "Running",
    issues: 0,
    date: "2024-01-15",
    duration: "1m 12s",
    vulnerabilities: [],
  },
];

export default function ScanManagementPage() {
  const [selectedScan, setSelectedScan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex">
      <DeveloperSideBar />

      <main className="flex-1 ml-64 p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Scans</h1>
            <p className="text-muted-foreground">
              View and manage your security scans
            </p>
          </div>

          <Button className="bg-sky-600 hover:bg-sky-700 shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </div>

        {/* Card */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Scan History</CardTitle>
            <CardDescription>
              A list of your recent automated security checks.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Issues</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="mr-10">Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {scanData.map((scan) => (
                  <TableRow key={scan.id} className="hover:bg-gray-50">
                    <TableCell>{scan.target}</TableCell>

                    <TableCell>
                      <Badge
                        className={
                          scan.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }
                      >
                        {scan.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <span
                        className={
                          scan.issues === 0
                            ? "text-emerald-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {scan.issues}
                      </span>
                    </TableCell>

                    <TableCell>{scan.date}</TableCell>
                    <TableCell>{scan.duration}</TableCell>

                    <TableCell className="text-right mr-6">
                      <div className="flex justify-end flex-wrap">
                        <Button
                          variant="ghost"
                          className=" bg-gray-400 hover:bg-sky-50 text-sky-600 w-full sm:w-auto cursor-pointer"
                          onClick={() => {
                            setSelectedScan(scan);
                            setOpenDialog(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Popup Dialog */}
        <ViewScanDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          scan={selectedScan}
        />
      </main>
    </div>
  );
}
