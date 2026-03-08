"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function DeveloperSettings() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [scanAlerts, setScanAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)
  const [apiAccess, setApiAccess] = useState(false)

  return (
    <div className="ml-64 p-6 space-y-6 bg-gray-50 min-h-screen">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <Button className="bg-[#003366] hover:bg-[#002244]">Save Changes</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue="John Doe" />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="john@example.com" />
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input defaultValue="+1 234 567 8900" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Scan Alerts</p>
                <p className="text-sm text-gray-500">
                  Get alerts when scans complete
                </p>
              </div>
              <Switch checked={scanAlerts} onCheckedChange={setScanAlerts} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-500">
                  Receive weekly summary reports
                </p>
              </div>
              <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">API Access</p>
                <p className="text-sm text-gray-500">
                  Enable API access for integrations
                </p>
              </div>
              <Switch checked={apiAccess} onCheckedChange={setApiAccess} />
            </div>

            <Separator />

            <Button variant="outline" className="w-full">
              Generate API Key
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <Button variant="outline" className="w-full">
              Change Password
            </Button>

            <Button variant="outline" className="w-full">
              Download My Data
            </Button>

            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
