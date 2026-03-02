"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShieldAlert, Play, Trash2, Eye } from "lucide-react"

export default function Page() {
  const [scans, setScans] = useState([
    {
      id: 1,
      name: "Website Security Scan",
      target: "example.com",
      status: "Completed",
      severity: "High",
      issues: 5,
    },
    {
      id: 2,
      name: "API Scan",
      target: "api.example.com",
      status: "In Progress",
      severity: "Medium",
      issues: 2,
    },
    {
      id: 3,
      name: "Mobile App Scan",
      target: "mobile.app",
      status: "Pending",
      severity: "Low",
      issues: 0,
    },
  ])

  const deleteScan = (id) => {
    setScans(scans.filter((scan) => scan.id !== id))
  }

  return (
    <div className="ml-64 p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scan Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor scan vulnerabilities
          </p>
        </div>

        <Button className="gap-2">
          <Play size={16} />
          Start New Scan
        </Button>
      </div>

      {/* Scan Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Scans</CardTitle>
        </CardHeader>

        <CardContent>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scan Name</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium">
                    {scan.name}
                  </TableCell>

                  <TableCell>{scan.target}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        scan.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : scan.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }
                    >
                      {scan.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        scan.severity === "High"
                          ? "bg-red-100 text-red-700"
                          : scan.severity === "Medium"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }
                    >
                      {scan.severity}
                    </Badge>
                  </TableCell>

                  <TableCell>{scan.issues}</TableCell>

                  <TableCell className="text-right flex gap-2 justify-end">

                    <Button size="sm" variant="outline">
                      <Eye size={14} />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteScan(scan.id)}
                    >
                      <Trash2 size={14} />
                    </Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>

        </CardContent>
      </Card>

    </div>
  )
}