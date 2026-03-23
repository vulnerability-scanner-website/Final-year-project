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
    if (status === "paid") return <Badge className="bg-green-600 text-white">Paid</Badge>;
    if (status === "free_trial") return <Badge className="bg-blue-600 text-white">Free Trial</Badge>;
    return <Badge variant="destructive">Pending</Badge>;
  };

  const activeRevenue = subscriptions
    .filter((s) => s.status === "active" && s.payment_status === "paid")
    .reduce((total, s) => total + parseFloat(s.amount || 0), 0);

  return (
    <div className="p-12 space-y-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#003366]">Subscription Management</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage user subscriptions and payment status</p>
        </div>

        <Card className="w-72 shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#003366]">ETB {activeRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="shadow-lg overflow-hidden bg-white rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#003366] hover:bg-[#003366]">
              <TableHead className="font-semibold text-base py-4 pl-6 text-yellow-100">ID</TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">User</TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">Plan</TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">Payment</TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">Status</TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">Period</TableHead>
              <TableHead className="font-semibold text-base py-4 text-right text-yellow-100">Amount</TableHead>
              <TableHead className="font-semibold text-base py-4 text-center pr-6 text-yellow-100">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => (
                <TableRow key={sub.id} className="border-b hover:bg-gray-100 transition-colors">
                  <TableCell className="font-mono text-sm py-6 pl-6 text-gray-800">
                    {String(sub.id).padStart(3, "0")}
                  </TableCell>

                  <TableCell className="py-6">
                    <div>
                      <p className="font-medium text-gray-900 text-base">{sub.email}</p>
                      <p className="text-sm text-gray-500">{sub.user_role}</p>
                    </div>
                  </TableCell>

                  <TableCell className="py-6">
                    <Badge variant="outline" className="font-medium text-sm py-1 border-[#003366] text-[#003366]">
                      {sub.plan_name}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-6">{getPaymentBadge(sub.payment_status)}</TableCell>

                  <TableCell className="py-6">
                    <Badge className={sub.status === "active" ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                      {sub.status === "active" ? "Activated" : "Deactivated"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-6">
                    <div className="text-sm">
                      <p className="text-gray-900">{new Date(sub.start_date).toLocaleDateString()}</p>
                      <p className="text-gray-500">to {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "—"}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right py-6">
                    <span className="font-semibold text-gray-900 text-base">ETB {sub.amount}</span>
                    <span className="text-gray-500 text-sm"> /mo</span>
                  </TableCell>

                  <TableCell className="py-6 pr-6">
                    <div className="flex gap-2 justify-center">
                      {sub.payment_status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmPayment(sub.id)}
                          className="bg-[#003366] hover:bg-[#002244]"
                        >
                          Confirm
                        </Button>
                      )}

                      {sub.status !== "active" ? (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(sub.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleDeactivate(sub.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-blue-100 bg-opacity-10 rounded-lg p-6 shadow-sm">
        <p className="text-base text-[#003366]">
          <span className="font-semibold">Note:</span> Payments are processed via Chapa. Admin can manually confirm or activate subscriptions.
        </p>
      </div>
    </div>
  );
}
