"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionBanner({ role }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/payments/subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading || !subscription) return null;

  const pricePath = role === "analyst" ? "/dashboard/analyst/price" : "/dashboard/developer/price";

  // No subscription
  if (subscription.status === "none" || !subscription.plan_name) {
    return (
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <CreditCard className="text-white/40 h-5 w-5" />
          <div>
            <p className="font-semibold text-white">No Active Subscription</p>
            <p className="text-sm text-white/40">Subscribe to a plan to unlock all features.</p>
          </div>
        </div>
        <button
          onClick={() => router.push(pricePath)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          Start free trial
        </button>
      </div>
    );
  }

  // Pending approval
  if (subscription.status === "pending") {
    return (
      <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-400 h-5 w-5" />
          <div>
            <p className="font-semibold text-yellow-400">Subscription Pending Approval</p>
            <p className="text-sm text-yellow-400/70">
              Your <span className="font-bold">{subscription.plan_name}</span> plan payment was received. Waiting for admin to activate your account.
            </p>
          </div>
        </div>
        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold px-3 py-1 rounded-full">Pending</span>
      </div>
    );
  }

  // Active
  if (subscription.status === "active") {
    return (
      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-400 h-5 w-5" />
          <div>
            <p className="font-semibold text-green-400">{subscription.plan_name} Plan — Active</p>
            <p className="text-sm text-green-400/70">
              Your subscription is active. Expires:{" "}
              {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
      </div>
    );
  }

  // Inactive / failed
  return (
    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-5 py-4">
      <div className="flex items-center gap-3">
        <XCircle className="text-red-400 h-5 w-5" />
        <div>
          <p className="font-semibold text-red-400">Subscription Inactive</p>
          <p className="text-sm text-red-400/70">Your subscription is not active. Please subscribe to continue.</p>
        </div>
      </div>
      <button
        onClick={() => router.push(pricePath)}
        className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm transition"
      >
        Renew
      </button>
    </div>
  );
}
