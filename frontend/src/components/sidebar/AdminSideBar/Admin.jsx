"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideHome,
  LucideUsers,
  LucideFileText,
  LucideSettings,
  LucideShield,
  LucideLogOut,
} from "lucide-react";

export default function AdminSideBar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard/admin", icon: <LucideHome size={20} /> },
    { name: "Security Findings", href: "/dashboard/admin/security_findings", icon: <LucideShield size={20} /> },
    { name: "Users Management", href: "/dashboard/admin/Users", icon: <LucideUsers size={20} /> },
    { name: "Reports", href: "/dashboard/admin/Reports", icon: <LucideFileText size={20} /> },
    { name: "Settings", href: "/dashboard/admin/settings", icon: <LucideSettings size={20} /> },
    { name: "Logout", href: "/", icon: <LucideLogOut size={20} />, color: "text-red-400" },
  ];

  return (
    <aside className="w-64 bg-[#003366] text-white p-6 min-h-screen shadow-xl flex flex-col fixed top-0 left-0">
      <h2 className="text-3xl font-extrabold mb-10 text-center text-[#FFFFFF] tracking-wider">
        Admin Panel
      </h2>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                ${
                  link.color
                    ? link.color
                    : isActive
                      ? "bg-orange-500 text-yellow-100 shadow-lg"
                      : "hover:bg-orange-500 hover:text-yellow-100 shadow-sm"
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
        © {new Date().getFullYear()} Admin
      </div>
    </aside>
  );
}