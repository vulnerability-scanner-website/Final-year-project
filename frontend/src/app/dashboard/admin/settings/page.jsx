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
    <div className="min-h-screen bg-[#101010] text-white space-y-4 w-full">
      <DashboardHeader role="settings" />

      <div className="px-4 pb-6 space-y-4">
      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-lg transition text-sm">Save Changes</button>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* University Info */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-white mb-1">University Information</h3>
          <p className="text-xs text-white/40 mb-4">Update your university's basic information</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50">University Name</label>
              <input defaultValue="INSA University" className="w-full mt-1 bg-[#101010] border border-white/10 text-white placeholder-white/30 p-2 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/50">Contact Email</label>
              <input defaultValue="admin@insa.fr" className="w-full mt-1 bg-[#101010] border border-white/10 text-white placeholder-white/30 p-2 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/50">Contact Phone</label>
              <input defaultValue="+33 1 23 45 67 89" className="w-full mt-1 bg-[#101010] border border-white/10 text-white placeholder-white/30 p-2 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/50">Address</label>
              <textarea defaultValue="123 University Street, Lyon, France" className="w-full mt-1 bg-[#101010] border border-white/10 text-white placeholder-white/30 p-2 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/50">Description</label>
              <textarea defaultValue="Leading engineering school specializing in technology and innovation." className="w-full mt-1 bg-[#101010] border border-white/10 text-white placeholder-white/30 p-2 rounded-lg focus:outline-none focus:border-yellow-500 transition text-sm" />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-white mb-1">Notification Settings</h3>
          <p className="text-xs text-white/40 mb-4">Configure how you receive notifications</p>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', desc: 'Receive notifications via email', state: emailNotif, set: setEmailNotif },
              { label: 'SMS Notifications', desc: 'Receive notifications via SMS', state: smsNotif, set: setSmsNotif },
              { label: 'Weekly Reports', desc: 'Receive weekly summary reports', state: weeklyReports, set: setWeeklyReports },
              { label: 'Evaluation Reminders', desc: 'Get reminders for pending evaluations', state: evaluationReminder, set: setEvaluationReminder },
            ].map(({ label, desc, state, set }) => (
              <div key={label}>
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <button
                    onClick={() => set(!state)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      state ? 'bg-orange-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      state ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="border-t border-white/5 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* System Settings */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-white mb-1">System Settings</h3>
          <p className="text-xs text-white/40 mb-4">Configure system behavior and permissions</p>
          <div className="space-y-4">
            {[
              { label: 'Auto-assign Supervisors', desc: 'Automatically assign supervisors', state: autoAssign, set: setAutoAssign },
              { label: 'Require Approval', desc: 'Require approval for applications', state: requireApproval, set: setRequireApproval },
            ].map(({ label, desc, state, set }) => (
              <div key={label}>
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <button
                    onClick={() => set(!state)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      state ? 'bg-orange-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      state ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="border-t border-white/5 mt-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-white mb-1">Account Management</h3>
          <p className="text-xs text-white/40 mb-4">Manage account security and access</p>
          <div className="space-y-3">
            {['Change Password', 'Manage User Roles', 'Email Templates'].map((label) => (
              <button key={label} className="w-full text-sm border border-white/10 text-white/70 hover:border-yellow-500 hover:text-yellow-400 py-2 rounded-lg transition">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}