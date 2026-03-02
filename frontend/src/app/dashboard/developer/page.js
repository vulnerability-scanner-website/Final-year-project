"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"

export default function Page() {

  const recentScans = [
    {
      id: 1,
      name: "Website Security Scan",
      date: "March 1, 2026",
      status: "Completed",
      issues: 5,
    },
    {
      id: 2,
      name: "API Vulnerability Scan",
      date: "March 2, 2026",
      status: "In Progress",
      issues: 2,
    },
    {
      id: 3,
      name: "Mobile App Scan",
      date: "March 3, 2026",
      status: "Completed",
      issues: 0,
    },
  ]

  return (
    <div className="ml-64 p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your security scans and vulnerabilities
          </p>
        </div>

        <Button className="gap-2">
          <Plus size={16} />
          New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">

        <StatCard title="My Scans" value="23" icon={<Shield />} color="blue" />
        <StatCard title="In Progress" value="3" icon={<Clock />} color="yellow" />
        <StatCard title="Completed" value="18" icon={<CheckCircle />} color="green" />
        <StatCard title="Total Issues" value="45" icon={<AlertCircle />} color="red" />

      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Scans</CardTitle>
          <CardDescription>
            Overview of your latest scans
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {recentScans.map((scan) => (
            <div
              key={scan.id}
              className="flex justify-between items-center border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div>
                <h4 className="font-semibold">{scan.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {scan.status} on {scan.date}
                </p>
              </div>

              <div className="flex items-center gap-4">

                <Badge
                  variant="secondary"
                  className={
                    scan.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {scan.status}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  {scan.issues} issues
                </span>

                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}

        </CardContent>
      </Card>

    </div>
  )
}


/* Reusable Stat Card */
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-600",
    yellow: "bg-yellow-500/10 text-yellow-600",
    green: "bg-green-500/10 text-green-600",
    red: "bg-red-500/10 text-red-600",
  }

  return (
    <Card>
      <CardContent className="flex justify-between items-center p-6">
        <div>
          <p className="text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>

        <div className={`p-4 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}