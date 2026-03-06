"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import ViewScanDialog from "@/components/popup/ViewScanDialog";
import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ScanManagementPage() {

  /* ---------------- State ---------------- */

  const [scans, setScans] = useState([
    {
      id: 1,
      target: "mywebsite.com",
      status: "Completed",
      issues: 2,
      date: "2024-01-15",
      duration: "2m 34s",
    },
    {
      id: 2,
      target: "api.mywebsite.com",
      status: "Running",
      issues: 0,
      date: "2024-01-15",
      duration: "1m 12s",
    },
  ]);

  const [selectedScan, setSelectedScan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [newScanOpen, setNewScanOpen] = useState(false);
  const [url, setUrl] = useState("");

  /* ---------------- Start Scan ---------------- */

  const handleStartScan = () => {
    if (!url) return;

    const newScan = {
      id: scans.length + 1,
      target: url,
      status: "Running",
      issues: 0,
      date: new Date().toISOString().split("T")[0],
      duration: "-",
    };

    setScans([newScan, ...scans]);
    setUrl("");
    setNewScanOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <AnalystSideBar />

      {/* Main */}
      <main className="flex-1 ml-64 p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Scans</h1>
            <p className="text-muted-foreground">
              View and manage your security scans
            </p>
          </div>

          <Button
            onClick={() => setNewScanOpen(true)}
            className="bg-[#003366] hover:bg-yellow-700 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Scan
          </Button>
        </div>

        {/* Scan Table */}
        <Card className="shadow-lg border-0 rounded-2xl mt-6">
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>
              A list of your recent automated security checks.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Issues</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {scans.map((scan) => (
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

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedScan(scan);
                          setOpenDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Scan Dialog */}
        <ViewScanDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          scan={selectedScan}
        />

        {/* New Scan Dialog */}
        <Dialog open={newScanOpen} onOpenChange={setNewScanOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Scan</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Enter target URL (example: https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <Button
                onClick={handleStartScan}
                className="w-full bg-[#003366] hover:bg-[#00264d]"
              >
                Start Scan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}