"use client";

import React from 'react';
import PricingSection4 from "@/components/ui/pricing-section-4";
import AnalystSideBar from "@/components/sidebar/AnalystSideBar/Analyst";

export default function Page() {
  return (
    <>
      <AnalystSideBar />
      <div className="ml-64">
        <PricingSection4 />
      </div>
    </>
  );
}
