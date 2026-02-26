"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Bell } from "lucide-react"

export function DashboardHeader({ role }) {

  const subtitle =
    role === "admin"
      ? "Manage users, security scans, and system settings"
      : "Manage your security scans and project vulnerabilities"

  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-4">
      
      {/* Left */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Scan
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
            3
          </Badge>
        </div>
      </div>

    </header>
  )
}