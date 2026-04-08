"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell } from "lucide-react";
import NewScanDialog from "@/components/popup/NewScanDialog";
import { useState, useEffect, useCallback } from "react";
import { notificationsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export function DashboardHeader({ role, onActionClick }) {
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState("developer");
  const router = useRouter();

  // Get actual user role from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role) setUserRole(user.role);
    } catch {}
  }, []);

  const notifPath =
    userRole === "admin"     ? "/dashboard/admin/notifications"
    : userRole === "developer" ? "/dashboard/developer/notifications"
    : "/dashboard/analyst/notifications";

  const fetchUnread = useCallback(async () => {
    try {
      const data = await notificationsAPI.getAll();
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const pageh1 =
    role === "admin"           ? "Admin Dashboard"
    : role === "usermanagement"  ? "User Management"
    : role === "scanmanagement"  ? "Scan Management"
    : role === "reports"         ? "Reports"
    : role === "settings"        ? "Settings"
    : "Dashboard";

  const pageparagraph =
    role === "admin"           ? "Overview of system status and key metrics"
    : role === "usermanagement"  ? "Manage user accounts and permissions"
    : "Overview of system status and key metrics";

  const pagebuttontext =
    role === "admin"           ? "New Scan"
    : role === "usermanagement"  ? "Add New User"
    : "New Action";

  const handleButtonClick = () => {
    if (role === "admin") setShowNewScanDialog(true);
    else if (onActionClick) onActionClick();
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 relative overflow-hidden bg-[#101010] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/5 to-transparent skew-y-12 origin-bottom-left" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-500/5 to-transparent -skew-y-12 origin-top-right" />
        </div>

        {/* Left */}
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{pageh1}</h1>
          <p className="text-sm text-white/40">{pageparagraph}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 relative z-10">

          {/* Notification Bell → navigates to notifications page */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer text-white/60 hover:text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => router.push(notifPath)}
            >
              <Bell className="h-5 w-5" />
            </Button>
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white border-0 text-[10px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <div className="relative inline-block group">
            <Button
              className="relative z-10 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold cursor-pointer transition-all duration-300"
              onClick={handleButtonClick}
            >
              <Plus className="h-4 w-4" />
              {pagebuttontext}
            </Button>
            <span className="absolute top-0 right-0 w-0 h-0 border-t-2 border-r-2 border-orange-400 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
            <span className="absolute bottom-0 left-0 w-0 h-0 border-b-2 border-l-2 border-orange-400 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
          </div>
        </div>
      </header>

      {role === "admin" && showNewScanDialog && (
        <NewScanDialog open={showNewScanDialog} onOpenChange={setShowNewScanDialog} />
      )}
    </>
  );
}
