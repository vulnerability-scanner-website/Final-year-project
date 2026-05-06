"use client";

import React from "react";
import { DashboardHeader } from "@/components/header/header";
import { BankStatementReport } from "@/components/ui/bank-statement-report";

export default function BankStatementPage() {
  return (
    <div className="min-h-screen bg-[#101010] text-white w-full">
      <DashboardHeader role="admin" />
      
      <div className="px-4 pb-6 pt-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Payment Transactions</h1>
          <p className="text-white/60 text-sm">
            View, filter, and download comprehensive bank statement reports for all payment transactions
          </p>
        </div>
        
        <BankStatementReport />
      </div>
    </div>
  );
}
