"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = "/api";

export default function PricingTable() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleActivate = async (id) => {
    try {
      await fetch(`${API_URL}/admin/subscriptions/${id}/activate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await fetch(`${API_URL}/admin/subscriptions/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPayment = async (id) => {
    try {
      await fetch(`${API_URL}/admin/subscriptions/${id}/confirm-payment`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const getPaymentBadge = (status) => {
    if (status === "paid") return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Paid</span>;
    if (status === "free_trial") return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Free Trial</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">Pending</span>;
  };

  const activeRevenue = subscriptions
    .filter((s) => s.status === "active" && s.payment_status === "paid")
    .reduce((total, s) => total + parseFloat(s.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#101010] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-white/40 mt-1">Manage user subscriptions and payment status</p>
        </div>
        <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-5 min-w-[220px]">
          <p className="text-sm text-yellow-400/70">Monthly Revenue</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">ETB {activeRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-yellow-400 font-semibold py-4 pl-6">ID</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4">User</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4">Plan</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4">Payment</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4">Status</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4">Period</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4 text-right">Amount</TableHead>
                <TableHead className="text-yellow-400 font-semibold py-4 text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-white/30">Loading...</TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-white/30">No subscriptions found</TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <TableCell className="font-mono text-sm py-5 pl-6 text-white/50">
                      {String(sub.id).padStart(3, "0")}
                    </TableCell>

                    <TableCell className="py-5">
                      <p className="font-medium text-white">{sub.email}</p>
                      <p className="text-sm text-orange-400 capitalize">{sub.user_role}</p>
                    </TableCell>

                    <TableCell className="py-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/20 text-yellow-400 bg-yellow-500/10">
                        {sub.plan_name}
                      </span>
                    </TableCell>

                    <TableCell className="py-5">{getPaymentBadge(sub.payment_status)}</TableCell>

                    <TableCell className="py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === "active"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {sub.status === "active" ? "Activated" : "Deactivated"}
                      </span>
                    </TableCell>

                    <TableCell className="py-5">
                      <p className="text-sm text-white">{new Date(sub.start_date).toLocaleDateString()}</p>
                      <p className="text-xs text-white/40">to {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "—"}</p>
                    </TableCell>

                    <TableCell className="text-right py-5">
                      <span className="font-semibold text-white">ETB {sub.amount}</span>
                      <span className="text-white/40 text-sm"> /mo</span>
                    </TableCell>

                    <TableCell className="py-5 pr-6">
                      <div className="flex gap-2 justify-center">
                        {sub.payment_status === "pending" && (
                          <button
                            onClick={() => handleConfirmPayment(sub.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500 hover:bg-yellow-400 text-black transition"
                          >
                            Confirm
                          </button>
                        )}
                        {sub.status !== "active" ? (
                          <button
                            onClick={() => handleActivate(sub.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeactivate(sub.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-sm text-yellow-400/70">
          <span className="font-semibold text-yellow-400">Note:</span> Payments are processed via Chapa.
        </p>
      </div>
    </div>
  );
}
