"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LucideHome,
  LucideUsers,
  LucideFileText,
  LucideSettings,
  LucideShield,
  LucideLogOut,
  Bell,
  Wallet,
  Menu,
  X
} from "lucide-react";
import { notificationsAPI } from "@/lib/api";

export default function AdminSideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await notificationsAPI.getAll();
        setUnreadCount(data.filter(n => !n.read).length);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { name: "Dashboard", href: "/dashboard/admin", icon: <LucideHome size={20} /> },
    { name: "Scan Management", href: "/dashboard/admin/scan_management", icon: <LucideShield size={20} /> },
    { name: "Subscription", href: "/dashboard/admin/price-management", icon: <Wallet size={20} /> },
    { name: "Users Management", href: "/dashboard/admin/Users", icon: <LucideUsers size={20} /> },
    { name: "Reports", href: "/dashboard/admin/Reports", icon: <LucideFileText size={20} /> },
    { name: "Notifications", href: "/dashboard/admin/notifications", icon: (
      <span className="relative">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </span>
    )},
    { name: "Settings", href: "/dashboard/admin/settings", icon: <LucideSettings size={20} /> },
    { name: "Logout", href: "/", icon: <LucideLogOut size={20} />, color: "text-red-400" },
  ];

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-[#1a1a1a] text-yellow-400 border border-yellow-500/30 rounded-lg shadow-lg md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#101010] border-r border-white/10 shadow-xl flex flex-col z-40
          ${isMobile 
            ? `fixed top-0 left-0 h-screen w-64 transition-transform duration-300
               ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'fixed top-0 left-0 w-64 h-screen'
          }
        `}
      >
        {/* Mobile close button */}
        {isMobile && isOpen && (
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} className="p-1 text-white/50 hover:text-white">
              <X size={24} />
            </button>
          </div>
        )}

        <div className={`${isMobile && isOpen ? 'pt-0' : 'pt-6'} px-6`}>
          <h2 className="text-2xl font-extrabold mb-10 text-center">
            <span className="text-yellow-400">Admin</span>
            <span className="text-orange-400"> Panel</span>
          </h2>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-4">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
               <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                  ${
                    link.color
                      ? "text-red-400 hover:bg-red-500/10"
                      : isActive
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-orange-500/20"
                        : "text-white/60 hover:bg-white/5 hover:text-yellow-400"
                  }
                `}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto text-center text-xs text-white/20 py-4 border-t border-white/5">
          © {new Date().getFullYear()} CyberTrace Admin
        </div>
      </aside>
    </>
  );
}