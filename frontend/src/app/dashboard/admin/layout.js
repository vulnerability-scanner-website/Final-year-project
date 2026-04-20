"use client";

import AdminSideBar from "../../../components/sidebar/AdminSideBar/Admin";
import { useAuth } from "@/lib/useAuth";

export default function AdminLayout({ children }) {
  useAuth('admin');
  return (
    <div className="flex min-h-screen w-full">
      <AdminSideBar />
      <main className="flex-1 bg-[#101010] min-h-screen overflow-x-hidden md:ml-64">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}