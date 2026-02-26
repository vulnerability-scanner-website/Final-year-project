import React from "react";
import { DashboardHeader } from "@/components/header/header";

export default function page() {
  return (
    <div>
      <DashboardHeader role={"admin"} />
      <h1>Admin Report dashboard</h1>
    </div>
  );
}
