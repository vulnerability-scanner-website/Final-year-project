"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideHome,
  LucideShield,
  LucideFileText,
  LucideLogOut,
  User2Icon,
} from "lucide-react";

export default function DeveloperSideBar() {
  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard/developer",
      icon: LucideHome,
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
      name: "Reports",
      href: "/dashboard/developer/reports",
      icon: LucideFileText,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r shadow-sm min-h-screen fixed left-0 top-0 flex flex-col">

      {/* Logo / Title */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-[#003366] tracking-wide text-center">
          Developer Panel
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium
              ${
                active
                  ? "bg-[#003366] text-white shadow"
                  : "text-gray-700 hover:bg-yellow-700"
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
  );
}