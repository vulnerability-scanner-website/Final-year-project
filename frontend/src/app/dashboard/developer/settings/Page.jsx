"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Page() {

  const [scanEmail, setScanEmail] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)
  const [autoScan, setAutoScan] = useState(false)

  return (
    <div className="ml-64 p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button>Save Changes</Button>
      </div>

      {/* Profile + Notifications */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Developer Account */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Account</CardTitle>
            <CardDescription>
              Manage your developer information
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

            <div>
              <label className="text-sm">Full Name</label>
              <Input defaultValue="Developer Name" />
            </div>

            <div>
              <label className="text-sm">Email</label>
              <Input defaultValue="developer@email.com" />
            </div>

            <div>
              <label className="text-sm">Organization</label>
              <Input placeholder="Company or Organization" />
            </div>

          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure alerts and report notifications
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="flex justify-between items-center">
              <div>
                <p>Scan Completion Email</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when scans finish
                </p>
              </div>
              <Switch checked={scanEmail} onCheckedChange={setScanEmail} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p>Critical Vulnerability Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Notify when critical vulnerabilities appear
                </p>
              </div>
              <Switch checked={criticalAlerts} onCheckedChange={setCriticalAlerts} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p>Weekly Security Reports</p>
                <p className="text-sm text-muted-foreground">
                  Receive weekly vulnerability summaries
                </p>
              </div>
              <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Scan Settings + Security */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Scan Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Configuration</CardTitle>
            <CardDescription>
              Control automated vulnerability scanning
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="flex justify-between items-center">
              <div>
                <p>Automatic Scanning</p>
                <p className="text-sm text-muted-foreground">
                  Run scans automatically
                </p>
              </div>
              <Switch checked={autoScan} onCheckedChange={setAutoScan} />
            </div>

          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage password and access
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

            <Button variant="outline" className="w-full">
              Change Password
            </Button>

            <Button variant="outline" className="w-full">
              Enable Two-Factor Authentication
            </Button>

            <Button variant="outline" className="w-full">
              Manage API Keys
            </Button>

          </CardContent>
        </Card>

      </div>

    </div>
  )
}