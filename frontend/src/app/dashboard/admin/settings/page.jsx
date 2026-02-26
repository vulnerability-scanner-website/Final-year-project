import React from 'react'
import {DashboardHeader} from "@/components/header/header";


export default function page() {
  return (
    <div className="ml-64 p-5 space-y-4">
      <DashboardHeader role="settings" />
      <h1>system settings</h1>
    </div>
  )
}



