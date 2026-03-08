"use client"

import { cn } from "@/lib/utils"

export function Sparkles({
  className,
}) {
  return <div className={cn("absolute inset-0", className)} />
}
