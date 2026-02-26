"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell } from "lucide-react";

export function DashboardHeader({ role, onActionClick }) {
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
        : "Overview of system status and key metrics";

  const pagebuttontext =
    role === "admin"
      ? "New Scan"
      : role === "usermanagement"
        ? "Add New User"
        : "New Action";

  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-4 relative z-10">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{pageh1}</h1>
        <p className="text-sm text-muted-foreground">{pageparagraph}</p>
      </div>

      {/* Right - Contains ONLY ONE button (Add New User) */}
      <div className="flex items-center gap-4 cursor-pointer">
         <div className="relative">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Bell className="h-5 w-5" />
          </Button>
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
            10
          </Badge>
        </div>
        <Button
          className="flex items-center gap-2 bg-[#003366] hover:bg-[#004080] text-white cursor-pointer"
          onClick={onActionClick} // This now controls the dialog
        >
          <Plus className="h-4 w-4" />
          {pagebuttontext}
        </Button>

        {/* Notification bell (optional - not a duplicate button) */}
      </div>
    </header>
  );
}
