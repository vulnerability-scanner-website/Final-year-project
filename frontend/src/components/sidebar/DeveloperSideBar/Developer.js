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
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[#1a1a1a] text-yellow-400 border border-yellow-500/30 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-[#101010] border-r border-white/10 shadow-xl flex flex-col z-40
        fixed top-0 left-0 h-screen w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="pt-6 px-6">
          <h2 className="text-2xl font-extrabold mb-10 text-center">
            <span className="text-yellow-400">Developer</span>
            <span className="text-orange-400"> Panel</span>
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                  ${
                    active
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-orange-500/20"
                      : "text-white/60 hover:bg-white/5 hover:text-yellow-400"
                  }`}
              >
                <Icon size={20} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 font-medium transition"
          >
            <LucideLogOut size={20} />
            Logout
          </Link>
        </div>

        <div className="text-center text-xs text-white/20 py-4 border-t border-white/5">
          © {new Date().getFullYear()} CyberTrace
        </div>
      </aside>
    </>
  );
}