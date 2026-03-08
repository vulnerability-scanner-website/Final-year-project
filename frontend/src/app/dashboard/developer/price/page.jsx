"use client";

import React from 'react';
import PricingSection4 from "@/components/ui/pricing-section-4";
import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";

export default function Page() {
  return (
    <>
      <DeveloperSideBar />
      <div className="ml-64">
        <PricingSection4 />
      </div>
    </>
  );
}
