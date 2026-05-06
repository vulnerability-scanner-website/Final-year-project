"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Filter,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBankStatementPDF } from "@/utils/bankStatementPDF";

export function BankStatementReport() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Summary statistics
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, dateRange, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/payments/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (t) => new Date(t.created_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (t) => new Date(t.created_at) <= new Date(dateRange.end)
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.chapa_tx_ref?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.payment_status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleDownloadPDF = () => {
    const doc = generateBankStatementPDF(filteredTransactions, summary, dateRange);
    doc.save(`Bank_Statement_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: "bg-green-500/10 text-green-400 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      failed: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return variants[status] || variants.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-[#1a1a1a] border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-400/70 text-xs">
              Total Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <DollarSign className="text-green-400/50" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-400/70 text-xs">
              Total Transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-400">
                {summary.totalTransactions}
              </div>
              <TrendingUp className="text-blue-400/50" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-400/70 text-xs">
              Successful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {summary.successfulPayments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-400/70 text-xs">
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {summary.pendingPayments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-red-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-400/70 text-xs">
              Failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {summary.failedPayments}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-white">Bank Statement</CardTitle>
              <CardDescription className="text-white/60">
                View and download payment transactions
              </CardDescription>
            </div>
            <Button
              onClick={handleDownloadPDF}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Download className="mr-2" size={16} />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="bg-[#101010] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="bg-[#101010] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">Search</Label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                  size={16}
                />
                <Input
                  placeholder="Email, plan, or tx ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#101010] border-white/10 text-white pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-[#101010] border border-white/10 text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#101010] border-white/10 hover:bg-[#101010]">
                  <TableHead className="text-white/80">Date</TableHead>
                  <TableHead className="text-white/80">Transaction ID</TableHead>
                  <TableHead className="text-white/80">User</TableHead>
                  <TableHead className="text-white/80">Plan</TableHead>
                  <TableHead className="text-white/80">Amount</TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-white/40 py-8"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="text-white/80 text-sm">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell className="text-white/60 text-xs font-mono">
                        {transaction.chapa_tx_ref?.substring(0, 20)}...
                      </TableCell>
                      <TableCell className="text-white/80 text-sm">
                        {transaction.user_email}
                      </TableCell>
                      <TableCell className="text-white/80 text-sm">
                        {transaction.plan_name}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border",
                            getStatusBadge(transaction.payment_status)
                          )}
                        >
                          {transaction.payment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-white/60 text-right">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Component = BankStatementReport;
