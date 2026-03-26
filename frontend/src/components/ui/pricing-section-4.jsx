"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import {VerticalCutReveal} from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import { CreditCardForm } from "@/components/ui/credit-card-form";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Basic",
    description:
      "Perfect for small projects and individual developers getting started",
    price: 0,
    yearlyPrice: 0, // No yearly option for Basic
    buttonText: "Get started",
    buttonVariant: "outline",
    includes: [
      "Basic Plan includes:",
      "10 Security scans per month",
      "Basic vulnerability detection",
      "Email support",
      "Scan history (30 days)",
      "PDF reports",
      "Dashboard access",
    ],
  },
  {
    name: "Professional",
    description:
      "Best for growing teams that need advanced security testing features",
    price: 1500,
    yearlyPrice: 15000,
    buttonText: "Get started",
    buttonVariant: "default",
    popular: true,
    includes: [
      "Everything in Basic, plus:",
      "50 Security scans per month",
      "Advanced threat detection",
      "Priority support",
      "Scan history (90 days)",
      "Detailed PDF reports",
      "API access",
      "Custom scan configurations",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Complete solution for large organizations with unlimited security needs",
    price: 4000,
    yearlyPrice: 40000,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    includes: [
      "Everything in Professional, plus:",
      "Unlimited security scans",
      "AI-powered threat detection",
      "24/7 dedicated support",
      "Unlimited scan history",
      "Advanced analytics dashboard",
      "Full API access",
      "Custom integrations",
      "Compliance reports",
    ],
  },
];

const PricingSwitch = ({ onSwitch }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-[#1a1a1a] border border-white/10 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-9 rounded-full sm:px-6 px-3 font-medium transition-colors text-sm",
            selected === "0" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow" : "text-white/50",
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-9 rounded-full sm:px-6 px-3 font-medium transition-colors text-sm",
            selected === "1" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow" : "text-white/50",
          )}
        >
          Yearly
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const pricingRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const handleGetStarted = async (plan) => {
    setSelectedPlan(plan);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      // First get plan id from backend by matching name
      const plansRes = await fetch('/api/pricing');
      const backendPlans = await plansRes.json();
      const matchedPlan = backendPlans.find(
        (p) => p.name.toLowerCase() === plan.name.toLowerCase()
      );

      if (!matchedPlan) {
        alert('Plan not found. Please contact admin.');
        return;
      }

      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: matchedPlan.id }),
      });

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
      alert('Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePricingPeriod = (value) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div className="min-h-screen w-full relative bg-[#101010] overflow-x-hidden" ref={pricingRef}>
      <article className="text-center mb-6 px-4 max-w-3xl mx-auto space-y-2 relative z-50">
        <h2 className="text-4xl font-bold text-white">
          Choose Your Security Scanning Plan
        </h2>
        <p className="text-white/40">
          Secure your applications with our comprehensive vulnerability scanning solutions.
        </p>
        <PricingSwitch onSwitch={togglePricingPeriod} />
      </article>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl gap-6 py-8 mx-auto px-4">
        {plans.map((plan) => (
          <div key={plan.name}>
            <Card className={`relative border ${
              plan.popular
                ? "bg-gradient-to-b from-yellow-500/10 to-orange-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10"
                : "bg-[#1a1a1a] border-white/10"
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <CardHeader className="text-left">
                <h3 className={`text-2xl font-bold mb-1 ${plan.popular ? 'text-yellow-400' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">
                    {isYearly ? plan.yearlyPrice : plan.price} ETB
                  </span>
                  <span className="ml-1 text-sm text-white/40">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm mt-1 text-white/40">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <button
                  onClick={() => handleGetStarted(plan)}
                  className={`w-full mb-6 py-3 text-base font-semibold rounded-lg cursor-pointer transition-opacity hover:opacity-90 ${
                    plan.popular
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.buttonText}{loading && selectedPlan?.name === plan.name ? '...' : ''}
                </button>

                <div className={`space-y-3 pt-4 border-t ${plan.popular ? 'border-yellow-500/20' : 'border-white/10'}`}>
                  <h4 className="font-semibold text-sm mb-3 text-white/50">{plan.includes[0]}</h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${plan.popular ? 'bg-yellow-400' : 'bg-orange-400'}`}></span>
                        <span className="text-sm text-white/60">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
