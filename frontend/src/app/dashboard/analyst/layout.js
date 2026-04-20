"use client";

import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst.jsx";
import { useAuth } from "@/lib/useAuth";

export default function AnalystLayout({ children }) {
  useAuth('analyst');
  return (
    <div className="flex min-h-screen w-full">
      <AnalystSideBar />
      <main className="flex-1 bg-[#101010] min-h-screen overflow-x-hidden md:ml-64">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
