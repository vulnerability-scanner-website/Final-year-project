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
        if (!token) { setLoading(false); return; }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/payments/subscription`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        // silently fail — banner just won't show
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading || !subscription) return null;

  const pricePath = role === "analyst" ? "/dashboard/analyst/price" : "/dashboard/developer/price";

  // Free plan (active or expired)
  if (subscription.status === "free" || subscription.status === "expired") {
    const used = subscription.free_scans_used || 0;
    const limit = subscription.free_scans_limit || 3;
    const pct = Math.min((used / limit) * 100, 100);
    const expired = subscription.expired;

    return (
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg px-5 py-4 gap-3
        ${expired ? "card-default border-red-500/20" : "card-default"}`}>
        <div className="flex items-center gap-3">
          <CreditCard className={`h-5 w-5 ${expired ? "text-red-400" : "text-white/40"}`} />
          <div>
            <p className={`font-semibold ${expired ? "text-red-400" : "text-white"}`}>
              {expired ? "Free Plan Expired" : "Free Plan"}
            </p>
            {expired ? (
              <p className="text-sm text-red-400/70">Your 3-month free trial has ended. Upgrade to continue scanning.</p>
            ) : (
              <div className="space-y-1 mt-1">
                <p className="text-sm text-white/40">{used}/{limit} scans used this month</p>
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-400" : pct >= 66 ? "bg-yellow-400" : "bg-green-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(pricePath)}
          className={`shrink-0 text-sm ${expired ? "btn-danger" : "btn-primary"}`}
        >
          {expired ? "Upgrade Now" : "Upgrade Plan"}
        </button>
      </div>
    );
  }

  // No subscription
  if (subscription.status === "none" || !subscription.plan_name) {
    return (
      <div className="card-default flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <CreditCard className="text-white/40 h-5 w-5" />
          <div>
            <p className="font-semibold text-white">No Active Subscription</p>
            <p className="text-sm text-white/40">Subscribe to a plan to unlock all features.</p>
          </div>
        </div>
        <button
          onClick={() => router.push(pricePath)}
          className="btn-primary text-sm"
        >
          View Plans
        </button>
      </div>
    );
  }

  // Pending approval
  if (subscription.status === "pending") {
    return (
      <div className="card-default border-yellow-500/20 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-400 h-5 w-5" />
          <div>
            <p className="font-semibold text-yellow-400">Subscription Pending</p>
            <p className="text-sm text-yellow-400/70">
              Your <span className="font-bold">{subscription.plan_name}</span> plan payment is being processed.
            </p>
          </div>
        </div>
        <span className="badge-warning">
          Pending
        </span>
      </div>
    );
  }

  // Active
  if (subscription.status === "active") {
    return (
      <div className="card-default border-green-500/20 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-400 h-5 w-5" />
          <div>
            <p className="font-semibold text-green-400">{subscription.plan_name} Plan — Active</p>
            <p className="text-sm text-green-400/70">
              Expires:{" "}
              {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
        <span className="badge-success">
          Active
        </span>
      </div>
    );
  }

  // Inactive / failed
  return (
    <div className="card-default border-red-500/20 flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <XCircle className="text-red-400 h-5 w-5" />
        <div>
          <p className="font-semibold text-red-400">Subscription Inactive</p>
          <p className="text-sm text-red-400/70">Your subscription is not active. Please subscribe to continue.</p>
        </div>
      </div>
      <button
        onClick={() => router.push(pricePath)}
        className="btn-danger text-sm"
      >
        Renew
      </button>
    </div>
  );
}
