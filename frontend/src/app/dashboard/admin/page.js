"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

export default function Page() {
  return (
    <div className="p-5 space-y-4">
      <Calendar />
      <Button>Add</Button>
    </div>
  )
}