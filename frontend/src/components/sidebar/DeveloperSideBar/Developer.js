"use client";

import Link from "next/link";
import {
  LucideHome,
  LucideShield,
  LucideFileText,
  LucideActivity,
  LucideLogOut,
  User2Icon,
} from "lucide-react";

export default function AnalystSideBar() {
  const links = [
    {
      name: "Dashboard",
      href: "/dashboard/developer",
      icon: <LucideHome size={20} />,
    },
    {
      name: "Scan Management",
      href: "/dashboard/developer/scan_management",
      icon: <User2Icon size={20} />,
    },
    {
      name: "Security Findings",
      href: "/dashboard/developer/security_findings",
      icon: <LucideShield size={20} />,
    },
    {
      name: "Reports",
      href: "/dashboard/developer/reports",
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
    <aside className="w-64 bg-[#003366] text-white p-6 min-h-screen shadow-lg flex flex-col">
      <h2 className="text-3xl font-extrabold mb-10 text-center text-[#FFFFFF ] tracking-wider">
        Developer Panel
      </h2>

      <nav className="flex-1 flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              link.color
                ? link.color
                : "hover:bg-orange-500 hover:text-yellow-100 shadow-sm"
            }`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Analyst
      </div>
    </aside>
  );
}
