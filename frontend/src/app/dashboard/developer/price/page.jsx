"use client";

import React from 'react';
import PricingSection4 from "@/components/ui/pricing-section-4";
import DeveloperSideBar from "@/components/sidebar/DeveloperSideBar/Developer";

export default function Page() {
  return (
    <>
      <DeveloperSideBar />
      <div className="md:ml-64 min-h-screen overflow-x-hidden">
        <PricingSection4 />
      </div>
    </>
  );
}
