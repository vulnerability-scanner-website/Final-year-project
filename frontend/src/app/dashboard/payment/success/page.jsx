"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Shield, Zap, ArrowRight, RefreshCw } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tx_ref = searchParams.get("tx_ref");
  const [status, setStatus] = useState("verifying");
  const [subscription, setSubscription] = useState(null);
  const [dots, setDots] = useState(".");

  // Animated dots for verifying state
  useEffect(() => {
    if (status !== "verifying") return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (!tx_ref) { setStatus("failed"); return; }
    const verify = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/payments/verify/${tx_ref}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          // Fetch subscription details
          const subRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/payments/subscription`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const subData = await subRes.json();
          setSubscription(subData);
          setStatus("activated");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };
    verify();
  }, [tx_ref]);

  const userRole =
    typeof window !== "undefined"
      ? (() => { try { return JSON.parse(atob((localStorage.getItem("token") || "..").split(".")[1] || "e30="))?.role; } catch { return null; } })()
      : null;

  const dashboardPath = userRole === "analyst" ? "/dashboard/analyst" : "/dashboard/developer";

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-4 py-10">

      {/* Verifying */}
      {status === "verifying" && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Verifying Payment{dots}</h2>
            <p className="text-white/40 mt-2 text-sm">Confirming your payment with Chapa. This takes just a moment.</p>
          </div>
          <div className="space-y-2">
            {["Connecting to payment gateway", "Verifying transaction", "Activating subscription"].map((step, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5">
                <Loader2 className="h-4 w-4 text-yellow-400 animate-spin shrink-0" />
                <span className="text-sm text-white/50">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activated */}
      {status === "activated" && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden max-w-md w-full">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-green-500/20 to-yellow-500/10 border-b border-white/10 px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-black" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
            <p className="text-green-400 text-sm mt-1 font-medium">Your subscription is now active</p>
          </div>

          <div className="p-8 space-y-5">
            {/* Plan details */}
            {subscription && subscription.plan_name && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Plan</span>
                  <span className="text-white font-semibold">{subscription.plan_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Amount</span>
                  <span className="text-yellow-400 font-semibold">ETB {subscription.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Status</span>
                  <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
                {subscription.end_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">Expires</span>
                    <span className="text-white/70 text-sm">
                      {new Date(subscription.end_date).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tx ref */}
            <div className="bg-white/5 rounded-lg px-4 py-2.5 flex items-center justify-between">
              <span className="text-white/30 text-xs">Transaction Ref</span>
              <span className="text-white/50 text-xs font-mono truncate max-w-[180px]">{tx_ref}</span>
            </div>

            {/* Info */}
            <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
              <p className="text-sm text-green-400/80 text-center">
                🎉 Your account has been automatically activated. You now have full access to all features.
              </p>
            </div>

            {/* CTA */}
            <div className="relative group">
              <button
                onClick={() => router.push(dashboardPath)}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
              <span className="absolute top-0 right-0 w-0 h-0 border-t-2 border-r-2 border-orange-400 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0 border-b-2 border-l-2 border-orange-400 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
            </div>
          </div>
        </div>
      )}

      {/* Failed */}
      {status === "failed" && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
            <p className="text-white/40 mt-2 text-sm">
              We could not verify your payment. Please try again or contact support.
            </p>
          </div>
          {tx_ref && (
            <div className="bg-white/5 rounded-lg px-4 py-2.5">
              <p className="text-white/30 text-xs font-mono">{tx_ref}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-lg transition"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
            <button
              onClick={() => router.push(dashboardPath)}
              className="w-full text-white/40 hover:text-white text-sm transition py-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
