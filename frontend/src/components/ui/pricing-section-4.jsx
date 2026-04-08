"use client";
import { useEffect, useState } from "react";
import { Check, Zap, Shield, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const PLAN_ICONS = {
  Free:         <Shield className="h-5 w-5 text-white/40" />,
  Basic:        <Zap className="h-5 w-5 text-yellow-400" />,
  Professional: <Star className="h-5 w-5 text-orange-400" />,
  Enterprise:   <Shield className="h-5 w-5 text-purple-400" />,
};

const PLAN_STYLES = {
  Free:         "border-white/10 bg-[#1a1a1a]",
  Basic:        "border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent",
  Professional: "border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-transparent shadow-lg shadow-orange-500/10",
  Enterprise:   "border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-transparent",
};

export default function PricingSection4() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [plansRes, subRes] = await Promise.all([
          fetch(`${API}/api/pricing`),
          fetch(`${API}/api/payments/subscription`, { headers }),
        ]);

        const plansData = await plansRes.json();
        const subData = await subRes.json();

        // Sort: Free, Basic, Professional, Enterprise
        const order = ["Free", "Basic", "Professional", "Enterprise"];
        const sorted = [...plansData].sort(
          (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
        );

        setPlans(sorted);
        setSubscription(subData);
      } catch (err) {
        setError("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (plan) => {
    // Free plan — no payment needed
    if (parseFloat(plan.price) === 0) return;

    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login"; return; }

    setInitiating(plan.id);
    setError(null);

    try {
      const res = await fetch(`${API}/api/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const data = await res.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError(data.error || "Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      setError("Payment initiation failed. Check your connection.");
    } finally {
      setInitiating(null);
    }
  };

  const isCurrentPlan = (plan) => {
    if (!subscription) return false;
    if (subscription.status === "free" && plan.name === "Free") return true;
    if (subscription.status === "active" && subscription.plan_name === plan.name) return true;
    return false;
  };

  const getButtonLabel = (plan) => {
    if (isCurrentPlan(plan)) return "Current Plan";
    if (parseFloat(plan.price) === 0) return "Free Plan";
    return "Subscribe Now";
  };

  const getFeatures = (plan) => {
    try {
      return Array.isArray(plan.features)
        ? plan.features
        : JSON.parse(plan.features || "[]");
    } catch { return []; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#101010] px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Choose Your Security Plan
        </h2>
        <p className="text-white/40 text-sm">
          Secure your applications with our vulnerability scanning solutions.
        </p>
      </div>

      {/* Current subscription banner */}
      {subscription && subscription.status === "active" && (
        <div className="max-w-5xl mx-auto mb-6 bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-400 shrink-0" />
          <p className="text-green-400 text-sm">
            You are on the <span className="font-bold">{subscription.plan_name}</span> plan.
            Expires: {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : "—"}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Plans grid — exactly 4 cards: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 max-w-6xl gap-5 mx-auto">
        {plans.map((plan) => {
          const features = getFeatures(plan);
          const isCurrent = isCurrentPlan(plan);
          const isPopular = plan.name === "Professional";
          const isFree = parseFloat(plan.price) === 0;
          const isLoading = initiating === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300",
                PLAN_STYLES[plan.name] || "border-white/10 bg-[#1a1a1a]",
                isCurrent && "ring-2 ring-yellow-500/50"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              )}

              {/* Plan name & price */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {PLAN_ICONS[plan.name] || <Zap className="h-5 w-5 text-white/40" />}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {isFree ? "Free" : `${parseFloat(plan.price).toLocaleString()} ETB`}
                  </span>
                  {!isFree && <span className="text-white/40 text-sm">/month</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => !isCurrent && !isFree && handleSubscribe(plan)}
                disabled={isCurrent || isFree || isLoading}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                  isCurrent
                    ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-default"
                    : isFree
                    ? "bg-white/5 text-white/40 border border-white/10 cursor-default"
                    : isPopular
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 cursor-pointer"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer"
                )}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  getButtonLabel(plan)
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Chapa note */}
      <p className="text-center text-white/20 text-xs mt-8">
        Payments are securely processed by Chapa. You will be redirected to complete your payment.
      </p>
    </div>
  );
}
