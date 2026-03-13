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
    <div className="space-y-4 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <DashboardHeader role="settings" />
        <Button className="w-full sm:w-auto text-sm md:text-base">Save Changes</Button>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* University Info */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">University Information</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Update your university's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
            <div>
              <label className="text-xs md:text-sm">University Name</label>
              <Input defaultValue="INSA University" className="text-sm md:text-base" />
            </div>

            <div>
              <label className="text-xs md:text-sm">Contact Email</label>
              <Input defaultValue="admin@insa.fr" className="text-sm md:text-base" />
            </div>

            <div>
              <label className="text-xs md:text-sm">Contact Phone</label>
              <Input defaultValue="+33 1 23 45 67 89" className="text-sm md:text-base" />
            </div>

            <div>
              <label className="text-xs md:text-sm">Address</label>
              <Textarea defaultValue="123 University Street, Lyon, France" className="text-sm md:text-base" />
            </div>

            <div>
              <label className="text-xs md:text-sm">Description</label>
              <Textarea defaultValue="Leading engineering school specializing in technology and innovation." className="text-sm md:text-base" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Notification Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5 p-4 md:p-6">

            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base">Email Notifications</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} className="flex-shrink-0" />
            </div>

            <Separator />

            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base">SMS Notifications</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} className="flex-shrink-0" />
            </div>

            <Separator />

            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base">Weekly Reports</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Receive weekly summary reports
                </p>
              </div>
              <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} className="flex-shrink-0" />
            </div>

            <Separator />

            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base">Evaluation Reminders</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Get reminders for pending evaluations
                </p>
              </div>
              <Switch
                checked={evaluationReminder}
                onCheckedChange={setEvaluationReminder}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* System Settings */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">System Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure system behavior and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5 p-4 md:p-6">

            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base">Auto-assign Supervisors</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Automatically assign supervisors
                </p>
              </div>
              <Switch checked={autoAssign} onCheckedChange={setAutoAssign} className="flex-shrink-0" />
            </div>

            <Separator />

            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base">Require Approval</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Require approval for applications 
                </p>
              </div>
              <Switch
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Account Management</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Manage account security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">

            <Button variant="outline" className="w-full text-sm md:text-base">
              Change Password
            </Button>

            <Button variant="outline" className="w-full text-sm md:text-base">
              Manage User Roles
            </Button>

            <Button variant="outline" className="w-full text-sm md:text-base">
              Email Templates
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}