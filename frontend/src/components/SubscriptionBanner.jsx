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
        const res = await fetch("http://localhost:5000/api/payments/subscription", {
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
      <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <CreditCard className="text-gray-500 h-5 w-5" />
          <div>
            <p className="font-semibold text-gray-700">No Active Subscription</p>
            <p className="text-sm text-gray-500">Subscribe to a plan to unlock all features.</p>
          </div>
        </div>
        <button
          onClick={() => router.push(pricePath)}
          className="bg-[#003366] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#004080] transition"
        >
          View Plans
        </button>
      </div>
    );
  }

  // Pending approval
  if (subscription.status === "pending") {
    return (
      <div className="flex items-center justify-between bg-yellow-50 border border-yellow-300 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-500 h-5 w-5" />
          <div>
            <p className="font-semibold text-yellow-800">
              Subscription Pending Approval
            </p>
            <p className="text-sm text-yellow-600">
              Your <span className="font-bold">{subscription.plan_name}</span> plan payment was received. Waiting for admin to activate your account.
            </p>
          </div>
        </div>
        <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
          Pending
        </span>
      </div>
    );
  }

  // Active
  if (subscription.status === "active") {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-500 h-5 w-5" />
          <div>
            <p className="font-semibold text-green-800">
              {subscription.plan_name} Plan — Active
            </p>
            <p className="text-sm text-green-600">
              Your subscription is active. Expires:{" "}
              {subscription.end_date
                ? new Date(subscription.end_date).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
        <span className="bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
          Active
        </span>
      </div>
    );
  }

  // Inactive / failed
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-300 rounded-lg px-5 py-4">
      <div className="flex items-center gap-3">
        <XCircle className="text-red-500 h-5 w-5" />
        <div>
          <p className="font-semibold text-red-800">Subscription Inactive</p>
          <p className="text-sm text-red-600">Your subscription is not active. Please subscribe to continue.</p>
        </div>
      </div>
      <button
        onClick={() => router.push(pricePath)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
      >
        Renew
      </button>
    </div>
  );
}
