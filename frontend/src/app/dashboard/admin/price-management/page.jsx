"use client";

import React from 'react';
import PricingTable from '@/components/ui/pricetable';
import AdminSideBar from '@/components/sidebar/AdminSideBar/Admin';

export default function Page() {
  return (
    <>
      <AdminSideBar />
      <div className="ml-64">
        <PricingTable/>
      </div>
    </>
  );
}
