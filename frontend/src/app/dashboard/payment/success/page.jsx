"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";

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

  const userRole = typeof window !== "undefined"
    ? JSON.parse(atob((localStorage.getItem("token") || "..").split(".")[1] || "e30="))?.role
    : null;

  const dashboardPath = userRole === "analyst"
    ? "/dashboard/analyst"
    : "/dashboard/developer";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">

        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#003366] border-t-transparent mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">Verifying Payment...</h2>
            <p className="text-gray-500">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "pending_approval" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">Payment Received!</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 justify-center text-yellow-700">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Pending Admin Approval</span>
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                Your payment was successful. Your subscription will be activated once the admin confirms your payment.
              </p>
            </div>
            <p className="text-sm text-gray-400">Ref: {tx_ref}</p>
            <button
              onClick={() => router.push(dashboardPath)}
              className="w-full bg-[#003366] text-white py-3 rounded-lg hover:bg-[#004080] transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-red-500 text-3xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
            <p className="text-gray-500">Something went wrong. Please try again.</p>
            <button
              onClick={() => router.back()}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </>
        )}

      </div>
    </div>
  );
}
