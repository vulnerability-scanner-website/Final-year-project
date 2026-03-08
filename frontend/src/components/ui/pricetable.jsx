"use client";

import { useState } from "react";
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

export default function PricingTable() {
  const [subscriptions, setSubscriptions] = useState([
    {
      subscriptionId: "SUB001",
      customerName: "Abdi",
      email: "john@example.com",
      plan: "Professional",
      status: "Active",
      paymentStatus: "paid",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      amount: "99",
    },
    {
      subscriptionId: "SUB002",
      customerName: "Jane Smith",
      email: "jane@example.com",
      plan: "Basic",
      status: "Active",
      paymentStatus: "free_trial",
      startDate: "2024-01-20",
      endDate: "2024-02-20",
      amount: "Free",
    },
    {
      subscriptionId: "SUB003",
      customerName: "Michael Brown",
      email: "michael@example.com",
      plan: "Enterprise",
      status: "Active",
      paymentStatus: "paid",
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      amount: " 299",
    },
    {
      subscriptionId: "SUB004",
      customerName: "Emily Johnson",
      email: "emily@example.com",
      plan: "Professional",
      status: "Inactive",
      paymentStatus: "pending",
      startDate: "2024-01-25",
      endDate: "2024-02-25",
      amount: "99",
    },
    {
      subscriptionId: "SUB005",
      customerName: "David Wilson",
      email: "david@example.com",
      plan: "Basic",
      status: "Active",
      paymentStatus: "paid",
      startDate: "2024-01-05",
      endDate: "2024-02-05",
      amount: "29",
    },
  ]);

  const handleActivate = (id) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.subscriptionId === id ? { ...sub, status: "Active" } : sub
      )
    );
  };

  const handleDeactivate = (id) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.subscriptionId === id ? { ...sub, status: "Inactive" } : sub
      )
    );
  };

  const handleConfirmPayment = (id) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.subscriptionId === id
          ? { ...sub, paymentStatus: "paid", status: "Active" }
          : sub
      )
    );
  };

  const getPaymentBadge = (status) => {
    if (status === "paid") {
      return <Badge className="bg-green-600 text-white">Paid</Badge>;
    }
    if (status === "free_trial") {
      return <Badge className="bg-blue-600 text-white">Free Trial</Badge>;
    }
    return <Badge variant="destructive">Pending</Badge>;
  };

  const activeRevenue = subscriptions
    .filter((sub) => sub.status === "Active" && sub.amount !== "Free")
    .reduce((total, sub) => total + parseFloat(sub.amount.slice(1)), 0);

  return (
    <div className="p-12 space-y-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#003366]">
            Subscription Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage user subscriptions and payment status
          </p>
        </div>

        <Card className="w-72 shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#003366]">
              ETB {activeRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="shadow-lg overflow-hidden bg-white rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#003366] hover:bg-[#003366]">
              <TableHead className="font-semibold text-base py-4 pl-6 text-yellow-100">
                ID
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">
                User
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">
                Plan
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">
                Payment
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">
                Status
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-yellow-100">
                Period
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-right text-yellow-100">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-base py-4 text-center pr-6 text-yellow-100">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow
                key={sub.subscriptionId}
                className="border-b hover:bg-gray-100 transition-colors"
              >
                <TableCell className="font-mono text-sm py-6 pl-6 text-gray-800">
                  {sub.subscriptionId}
                </TableCell>

                <TableCell className="py-6">
                  <div>
                    <p className="font-medium text-gray-900 text-base">
                      {sub.customerName}
                    </p>
                    <p className="text-sm text-gray-500">{sub.email}</p>
                  </div>
                </TableCell>

                <TableCell className="py-6">
                  <Badge
                    variant="outline"
                    className="font-medium text-sm py-1 border-[#003366] text-[#003366]"
                  >
                    {sub.plan}
                  </Badge>
                </TableCell>

                <TableCell className="py-6">
                  {getPaymentBadge(sub.paymentStatus)}
                </TableCell>

                <TableCell className="py-6">
                  <Badge
                    className={
                      sub.status === "Active"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }
                  >
                    {sub.status === "Active" ? "Activated" : "Deactivated"}
                  </Badge>
                </TableCell>

                <TableCell className="py-6">
                  <div className="text-sm">
                    <p className="text-gray-900">{sub.startDate}</p>
                    <p className="text-gray-500">to {sub.endDate}</p>
                  </div>
                </TableCell>

                <TableCell className="text-right py-6">
                  <span className="font-semibold text-gray-900 text-base">
                    {sub.amount}
                  </span>
                  {sub.amount !== "Free" && (
                    <span className="text-gray-500 text-sm"> /mo</span>
                  )}
                </TableCell>

                <TableCell className="py-6 pr-6">
                  <div className="flex gap-2 justify-center">
                    {sub.paymentStatus === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleConfirmPayment(sub.subscriptionId)
                        }
                        className="bg-[#003366] hover:bg-[#002244]"
                      >
                        Confirm
                      </Button>
                    )}

                    {sub.status === "Inactive" ? (
                      <Button
                        size="sm"
                        onClick={() => handleActivate(sub.subscriptionId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleDeactivate(sub.subscriptionId)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-blue-100 bg-opacity-10 rounded-lg p-6 shadow-sm">
        <p className="text-base text-[#003366]">
          <span className="font-semibold">Note:</span> Basic plan users get 1
          month free trial. After the trial period, they need to pay
          $29/month to continue.
        </p>
      </div>
    </div>
  );
}