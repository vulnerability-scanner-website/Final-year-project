"use client";

import Link from "next/link";

export default function DeveloperSideBar() {
  return (
    <aside className="w-64 bg-gray-200  p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8"> Developer </h2>

      <nav className="space-y-4">
        <Link href="/dashboard/admin" className="block hover:text-blue-400">
          Dashboard
        </Link>

        <Link href="/dashboard/admin/applications" className="block hover:text-blue-400">
          Applications
        </Link>

        <Link href="/dashboard/admin/settings" className="block hover:text-blue-400">
          Settings
        </Link>
      </nav>
    </aside>
  );
}