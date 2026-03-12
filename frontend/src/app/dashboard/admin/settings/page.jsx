"use client"

import React, { useState } from "react"
import { DashboardHeader } from "@/components/header/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Page() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [evaluationReminder, setEvaluationReminder] = useState(true)
  const [autoAssign, setAutoAssign] = useState(false)
  const [requireApproval, setRequireApproval] = useState(true)

  return (
    <div className="ml-64 p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <DashboardHeader role="settings" />
        <Button>Save Changes</Button>
      </div>

      {/* Top Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* University Info */}
        <Card>
          <CardHeader>
            <CardTitle>University Information</CardTitle>
            <CardDescription>
              Update your university's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm">University Name</label>
              <Input defaultValue="INSA University" />
            </div>

            <div>
              <label className="text-sm">Contact Email</label>
              <Input defaultValue="admin@insa.fr" />
            </div>

            <div>
              <label className="text-sm">Contact Phone</label>
              <Input defaultValue="+33 1 23 45 67 89" />
            </div>

            <div>
              <label className="text-sm">Address</label>
              <Textarea defaultValue="123 University Street, Lyon, France" />
            </div>

            <div>
              <label className="text-sm">Description</label>
              <Textarea defaultValue="Leading engineering school specializing in technology and innovation." />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="flex justify-between items-center">
              <div>
                <p>Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p>SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p>Weekly Reports</p>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summary reports
                </p>
              </div>
              <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p>Evaluation Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminders for pending evaluations
                </p>
              </div>
              <Switch
                checked={evaluationReminder}
                onCheckedChange={setEvaluationReminder}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system behavior and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="flex justify-between items-center">
              <div>
                <p>Auto-assign Supervisors</p>
                <p className="text-sm text-muted-foreground">
                  Automatically assign supervisors
                </p>
              </div>
              <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p>Require Approval</p>
                <p className="text-sm text-muted-foreground">
                  Require approval for applications 
                </p>
              </div>
              <Switch
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage account security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <Button variant="outline" className="w-full">
              Change Password
            </Button>

            <Button variant="outline" className="w-full">
              Manage User Roles
            </Button>

            <Button variant="outline" className="w-full">
              Email Templates
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}