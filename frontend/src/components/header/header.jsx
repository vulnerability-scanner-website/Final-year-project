"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell } from "lucide-react";
import NewScanDialog from "@/components/popup/NewScanDialog";
import { useState } from "react";

export function DashboardHeader({ role, onActionClick }) {
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);

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

  const handleButtonClick = () => {
    if (role === "admin") {
      setShowNewScanDialog(true);
    } else if (onActionClick) {
      onActionClick();
    }
  };

  return (
    <>
    <header className="flex items-center justify-between border-b bg-background px-6 py-4 relative overflow-hidden">
      {/* Bent header effect: bottom-left and top-right angled strips */}
      <div className="absolute inset-0 pointer-events-none">
        {/* bottom-left bent strip */}
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-transparent skew-y-12 origin-bottom-left"></div>
        {/* top-right bent strip */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent -skew-y-12 origin-top-right"></div>
      </div>

      {/* Left - with higher z-index to appear above bent effect */}
      <div className="relative z-10">
        <h1 className="text-2xl font-semibold tracking-tight">{pageh1}</h1>
        <p className="text-sm text-muted-foreground">{pageparagraph}</p>
      </div>

      {/* Right - Notification + Add Button (with higher z-index) */}
      <div className="flex items-center gap-4 cursor-pointer relative z-10">
        {/* Notification Bell */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Bell className="h-5 w-5" />
          </Button>
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
            10
          </Badge>
        </div>

        {/* Add New User Button with Corner Border Hover Effect */}
        <div className="relative inline-block group">
          <Button
            className="relative z-10 flex items-center gap-2 bg-[#003366] hover:bg-[#004080] text-white cursor-pointer transition-all duration-300"
            onClick={handleButtonClick}
          >
            <Plus className="h-4 w-4" />
            {pagebuttontext}
          </Button>
          <span className="absolute top-0 right-0 w-0 h-0 border-t-2 border-r-2 border-yellow-400 group-hover:w-6 group-hover:h-6 transition-all duration-300"></span>

          {/* Bottom Left Corner Border */}
          <span className="absolute bottom-0 left-0 w-0 h-0 border-b-2 border-l-2 border-yellow-400 group-hover:w-6 group-hover:h-6 transition-all duration-300"></span>
        </div>
      </div>
    </header>
    {role === "admin" && showNewScanDialog && (
      <NewScanDialog open={showNewScanDialog} onOpenChange={setShowNewScanDialog} />
    )}
    </>
  );
}