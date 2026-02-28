"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideBar />

      <div className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">
          Notification Page
        </h1>

        <Button>view notifications</Button>
      </div>
    </div>
  );
}