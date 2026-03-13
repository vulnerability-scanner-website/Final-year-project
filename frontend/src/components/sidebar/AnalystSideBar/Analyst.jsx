"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LucideHome,
  LucideShield,
  LucideFileText,
  LucideActivity,
  LucideLogOut,
  Wallet,
  Menu,
  X
} from "lucide-react";

export default function AnalystSideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard/analyst",
      icon: <LucideHome size={20} />,
    },
    {
      name: "subcription",
      href: "/dashboard/analyst/price",
      icon: <Wallet size={20} />,
    },
    {
      name: "Scan Management",
      href: "/dashboard/analyst/scan_management",
      icon: <LucideActivity size={20} />,
    },
    {
      name: "Security Findings",
      href: "/dashboard/analyst/Security_findings",
      icon: <LucideShield size={20} />,
    },
    {
      name: "Reports",
      href: "/dashboard/analyst/Reports",
      icon: <LucideFileText size={20} />,
    },
    {
      name: "Logout",
      href: "/",
      icon: <LucideLogOut size={20} />,
      color: "text-red-400",
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
        w-64 bg-[#ffffff] p-6 min-h-screen shadow-xl flex flex-col fixed top-0 left-0 z-40
        transition-transform duration-300 ease-in-out
        ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }
      `}>
        {/* Close button inside sidebar for mobile */}
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold mb-10 text-center tracking-wider text-gray-800">
          SecurAnalyst
        </h2>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
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

        <div className="mt-auto text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Analyst
        </div>
      </aside>
    </>
  );
}