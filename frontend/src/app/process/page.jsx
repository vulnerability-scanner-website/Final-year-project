"use client";

import { QuantumTimeline } from "@/components/ui/premium-process-timeline";

export default function ProcessPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <QuantumTimeline />
    </div>
  );
}
