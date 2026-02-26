"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell } from "lucide-react";

export function DashboardHeader({ role }) {
  // const subtitle =
  //   role === "admin"
  //     ? "Manage users, security scans, and system settings"
  //     : "Manage your security scans and project vulnerabilities"

  const pageh1 =
    role === "admin"
      ? "Admin Dashboard"
      : role === "usermanagement"
        ? "User Management"
        : role === "scanmanagement"
          ? "Scan Management"
          : role === "reports"
            ? "Reports"
            : role === "settings"
              ? "Settings"
              : "Dashboard";
  const pageparagraph =
    role === "admin"
      ? "Overview of system status and key metrics"
      : role === "usermanagement"
        ? "Manage user accounts and permissions"
        : role === "scanmanagement"
          ? "View and manage security scans"
          : role === "reports"
            ? "Generate and view security reports"
            : role === "settings"
              ? "Configure system settings and preferences"
              : "Overview of system status and key metrics";
  const pagebuttontext =
    role === "admin"
      ? "New Scan"
      : role === "usermanagement"
        ? "New User"
        : role === "scanmanagement"
          ? "New Scan"
          : role === "reports"
            ? "Generate Report"
            : role === "settings"
              ? "Update Settings"
              : "New Scan";

  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-4">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{pageh1}</h1>
        <p className="text-sm text-muted-foreground">{pageparagraph}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {pagebuttontext}
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
  );
}
