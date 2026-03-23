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

export default function AdminSideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Auto-open on desktop
      } else {
        setIsOpen(false); // Auto-close on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const links = [
    { name: "Dashboard", href: "/dashboard/admin", icon: <LucideHome size={20} /> },
    { name: "Scan Management", href: "/dashboard/admin/scan_management", icon: <LucideShield size={20} /> },
    { name: "Subscription", href: "/dashboard/admin/price-management", icon: <Wallet size={20} /> },
    { name: "Users Management", href: "/dashboard/admin/Users", icon: <LucideUsers size={20} /> },
    { name: "Reports", href: "/dashboard/admin/Reports", icon: <LucideFileText size={20} /> },
    { name: "Notifications", href: "/dashboard/admin/notifications", icon: <Bell size={20} /> },
    { name: "Settings", href: "/dashboard/admin/settings", icon: <LucideSettings size={20} /> },
    { name: "Logout", href: "/", icon: <LucideLogOut size={20} />, color: "text-red-400" },
  ];

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-[#003366] text-white rounded-lg shadow-lg md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white shadow-xl flex flex-col z-40
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
            <button onClick={() => setIsOpen(false)} className="p-1">
              <X size={24} />
            </button>
          </div>
        )}

        <div className={`${isMobile && isOpen ? 'pt-0' : 'pt-6'} px-6`}>
          <h2 className="text-2xl font-extrabold mb-10 text-center">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto px-4">
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
                      ? link.color
                      : isActive
                        ? "bg-[#003366] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-400 hover:to-yellow-400 hover:text-white shadow-sm"
                  }
                `}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto text-center text-sm text-gray-400 py-4">
          © {new Date().getFullYear()} Admin
        </div>
      </aside>
    </>
  );
}