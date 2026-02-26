"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DashboardHeader } from "@/components/header/header";

export default function Page() {
  return (
    <div className="p-5 space-y-4">
      <DashboardHeader role={"admin"} />
    </div>
  );
}
