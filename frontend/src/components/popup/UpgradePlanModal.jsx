"use client";
import { useRouter } from "next/navigation";
import { Zap, X, ShieldAlert } from "lucide-react";

export default function UpgradePlanModal({ open, onClose, scansUsed = 3, role = "developer" }) {
  const router = useRouter();
  const pricePath = role === "analyst" ? "/dashboard/analyst/price" : "/dashboard/developer/price";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="card-elevated max-w-md w-full relative shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="btn-ghost absolute top-4 right-4 p-1.5"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-6">
          <h2 className="text-xl font-bold text-white">Free Plan Limit Reached</h2>
          <p className="text-white/50 text-sm">
            You have used all <span className="text-yellow-400 font-semibold">{scansUsed} free scans</span> included in your free plan.
            Upgrade to continue scanning and unlock advanced features.
          </p>
        </div>

        {/* Features teaser */}
        <div className="card-default mb-6 space-y-2">
          {[
            "10–Unlimited scans per month",
            "Advanced vulnerability detection",
            "AI-powered threat analysis",
            "Priority support",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/60">
              <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <button
              onClick={() => { onClose(); router.push(pricePath); }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" /> Upgrade Plan
            </button>
            <span className="absolute top-0 right-0 w-0 h-0 border-t-2 border-r-2 border-[#F97316] group-hover:w-5 group-hover:h-5 transition-all duration-300" />
            <span className="absolute bottom-0 left-0 w-0 h-0 border-b-2 border-l-2 border-[#F97316] group-hover:w-5 group-hover:h-5 transition-all duration-300" />
          </div>
          <button
            onClick={onClose}
            className="btn-ghost w-full text-sm py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
