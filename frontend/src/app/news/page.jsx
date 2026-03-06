"use client";

import { NewsCards } from "@/components/ui/news-cards";
import { useState } from "react";

export default function NewsPage() {
  const [enableAnimations, setEnableAnimations] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto py-8">
        <NewsCards
          enableAnimations={enableAnimations}
        />
      </div>
    </div>
  );
}
