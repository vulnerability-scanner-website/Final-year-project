"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LucideHome,
  LucideShield,
  LucideFileText,
  LucideLogOut,
  User2Icon,
  Wallet,
  Settings,
  Menu,
  X
} from "lucide-react";

export default function DeveloperSideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard/developer",
      icon: LucideHome,
    },
    {
      name: "subcription",
      href: "/dashboard/developer/price",
      icon: Wallet,
    },
    {
      name: "Scan Management",
      href: "/dashboard/developer/scan_management",
      icon: User2Icon,
    },
    {
      name: "Security Findings",
      href: "/dashboard/developer/security_findings",
      icon: LucideShield,
    },
    {
      name: "settings",
      href: "/dashboard/developer/settings",
      icon: Settings,
    },
    {
      name: "Reports",
      href: "/dashboard/developer/reports",
      icon: LucideFileText,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[#003366] text-white rounded-lg shadow-2xl hover:bg-[#004488] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r shadow-sm min-h-screen fixed left-0 top-0 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }
      `}>
        {/* Close button inside sidebar for mobile */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Logo / Title */}
        <div className="p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-[#003366] tracking-wide text-center">
            Developer Panel
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium
                ${
                  active
                    ? "bg-[#003366] text-white shadow"
                    : "text-gray-700 hover:bg-yellow-700 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 font-medium"
          >
            <LucideLogOut size={20} />
            Logout
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} CyberTrace
        </div>
      </aside>
    </>
  );
}