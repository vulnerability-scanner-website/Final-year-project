"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tx_ref = searchParams.get("tx_ref");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (!tx_ref) return;
    const verify = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/payments/verify/${tx_ref}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStatus(data.success ? "pending_approval" : "failed");
      } catch {
        setStatus("failed");
      }
    };
    verify();
  }, [tx_ref]);

  const userRole =
    typeof window !== "undefined"
      ? JSON.parse(atob((localStorage.getItem("token") || "..").split(".")[1] || "e30="))?.role
      : null;

  const dashboardPath =
    userRole === "analyst" ? "/dashboard/analyst" : "/dashboard/developer";

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-6">

        {status === "verifying" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-yellow-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verifying Payment...</h2>
            <p className="text-white/40">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "pending_approval" && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-yellow-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Received!</h2>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 justify-center text-yellow-400 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Pending Admin Approval</span>
              </div>
              <p className="text-sm text-white/50">
                Your payment was successful. Your subscription will be activated once the admin confirms your payment.
              </p>
            </div>

            <p className="text-xs text-white/30">Ref: {tx_ref}</p>

            <div className="relative inline-block group w-full">
              <button
                onClick={() => router.push(dashboardPath)}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-lg transition"
              >
                Go to Dashboard
              </button>
              <span className="absolute top-0 right-0 w-0 h-0 border-t-2 border-r-2 border-orange-400 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0 border-b-2 border-l-2 border-orange-400 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
            <p className="text-white/40">Something went wrong. Please try again.</p>

            <button
              onClick={() => router.back()}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold py-3 rounded-lg transition"
            >
              Try Again
            </button>
          </>
        )}

      </div>
    </div>
  );
}
