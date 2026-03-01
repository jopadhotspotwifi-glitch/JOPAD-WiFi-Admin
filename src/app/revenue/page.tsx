"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { revenueAPI } from "@/services/api";
import type {
  RevenueData,
  RevenueByClient,
  RevenueByPlan,
  WithdrawalRecord,
} from "@/types";

const periodMap: Record<string, string> = {
  "7days": "7d",
  "30days": "30d",
  "90days": "90d",
  year: "1y",
};

export default function RevenuePage() {
  return (
    <ProtectedRoute>
      <RevenueContent />
    </ProtectedRoute>
  );
}

function RevenueContent() {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState<
    "7days" | "30days" | "90days" | "year"
  >("30days");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [revenueByClient, setRevenueByClient] = useState<RevenueByClient[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlan[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [clientRevenue, setClientRevenue] = useState(0);
  const [revenueShare, setRevenueShare] = useState(15);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(0);
  const [recentWithdrawals, setRecentWithdrawals] = useState<
    WithdrawalRecord[]
  >([]);
  const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(
    null,
  );
  const [withdrawalsPage, setWithdrawalsPage] = useState(0);
  const WITHDRAWALS_PAGE_SIZE = 10;
  const [adminWithdrawableBalance, setAdminWithdrawableBalance] = useState(0);
  const [showAdminWithdrawModal, setShowAdminWithdrawModal] = useState(false);
  const [adminWithdrawStep, setAdminWithdrawStep] = useState<
    "form" | "confirm" | "done"
  >("form");
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState("");
  const [adminWithdrawMethod, setAdminWithdrawMethod] = useState<
    "mobile_money" | "bank"
  >("mobile_money");
  const [adminWithdrawPhone, setAdminWithdrawPhone] = useState("");
  const [adminWithdrawBankName, setAdminWithdrawBankName] = useState("");
  const [adminWithdrawAccNum, setAdminWithdrawAccNum] = useState("");
  const [adminWithdrawAccName, setAdminWithdrawAccName] = useState("");
  const [adminWithdrawNote, setAdminWithdrawNote] = useState("");
  const [adminWithdrawError, setAdminWithdrawError] = useState("");
  const [adminWithdrawLoading, setAdminWithdrawLoading] = useState(false);

  const handleMarkWithdrawalComplete = async (withdrawalId: string) => {
    if (!token) return;
    setUpdatingWithdrawal(withdrawalId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/admin/revenue/withdrawals/${withdrawalId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setRecentWithdrawals((prev) =>
          prev.map((w) =>
            w._id === withdrawalId ? { ...w, status: "completed" as const } : w,
          ),
        );
        // Refresh summary counts
        setPendingWithdrawalCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to update withdrawal:", err);
    } finally {
      setUpdatingWithdrawal(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);
      setError("");
      try {
        const res = await revenueAPI.get(token, periodMap[timeRange]);
        if (res.success && res.revenue) {
          setRevenueTrend(res.revenue.trend);
          setRevenueByClient(res.revenue.byClient);
          setRevenueByPlan(res.revenue.byPlan);
          setTotalRevenue(res.revenue.totalRevenue);
          setPlatformRevenue(res.revenue.platformRevenue);
          setClientRevenue(res.revenue.clientRevenue);
          setRevenueShare(res.revenue.revenueShare);
          if (res.revenue.adminWithdrawableBalance !== undefined) {
            setAdminWithdrawableBalance(res.revenue.adminWithdrawableBalance);
          }
          if (res.revenue.withdrawals) {
            setTotalWithdrawn(res.revenue.withdrawals.totalWithdrawn);
            setPendingWithdrawals(res.revenue.withdrawals.pendingAmount);
            setPendingWithdrawalCount(res.revenue.withdrawals.pendingCount);
            setRecentWithdrawals(res.revenue.withdrawals.recent ?? []);
          }
        } else {
          setError("Failed to load revenue data");
        }
      } catch {
        setError("Failed to load revenue data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, timeRange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`;
    }
    return `UGX ${(amount / 1000).toFixed(0)}K`;
  };

  const timeRangeLabel =
    timeRange === "year"
      ? "Last 12 months"
      : timeRange === "90days"
        ? "Last 90 days"
        : timeRange === "7days"
          ? "Last 7 days"
          : "Last 30 days";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Revenue"
          subtitle="Platform revenue tracking and financial insights"
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Time Range Selector */}
          <div className="flex justify-end mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setTimeRange("7days")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "7days"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30days")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "30days"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange("90days")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "90days"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                90 Days
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeRange === "year"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Year
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading revenue data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Admin Withdrawable Balance Banner */}
              <div className="mb-6 flex items-center justify-between rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-purple-50 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    Your Available Balance (Platform Cut)
                  </p>
                  <p className="mt-0.5 text-3xl font-bold text-indigo-900">
                    UGX {adminWithdrawableBalance.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-indigo-500">
                    Accumulated {revenueShare}% platform share minus prior
                    withdrawals
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAdminWithdrawStep("form");
                    setAdminWithdrawAmount("");
                    setAdminWithdrawError("");
                    setShowAdminWithdrawModal(true);
                  }}
                  disabled={adminWithdrawableBalance < 1000}
                  className="ml-4 shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Withdraw
                </button>
              </div>

              {/* Revenue Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </h3>
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{timeRangeLabel}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Platform Revenue ({revenueShare}%)
                    </h3>
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(platformRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    From all transactions
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Client Revenue ({100 - revenueShare}%)
                    </h3>
                    <svg
                      className="w-5 h-5 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(clientRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Distributed to clients
                  </p>
                </div>
              </div>

              {/* Revenue Trend Chart */}
              {revenueTrend.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Revenue Trend
                    </h2>
                    <span className="text-sm text-gray-500">
                      {timeRangeLabel}
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={288}>
                    <AreaChart
                      data={revenueTrend}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#2563eb"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v: number) => formatCurrency(v)}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        formatter={(
                          value: number | undefined,
                          name: string | undefined,
                        ) => {
                          const v = value ?? 0;
                          if (name === "revenue")
                            return [formatCurrency(v), "Revenue"];
                          if (name === "sessions")
                            return [v.toLocaleString(), "Sessions"];
                          return [v, name ?? ""];
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                        dot={false}
                        activeDot={{ r: 4 }}
                        name="revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center py-16">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-gray-900 font-medium mb-1">
                    No revenue data yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Revenue data will appear once payments are processed.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Client */}{" "}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Top Clients by Revenue
                  </h2>
                  {revenueByClient.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height={revenueByClient.length * 52 + 20}
                    >
                      <BarChart
                        layout="vertical"
                        data={revenueByClient}
                        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tickFormatter={(v: number) => formatCurrency(v)}
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="clientName"
                          tick={{ fontSize: 12, fill: "#374151" }}
                          axisLine={false}
                          tickLine={false}
                          width={110}
                        />
                        <Tooltip
                          formatter={(value: number | undefined) => [
                            formatCurrency(value ?? 0),
                            "Revenue",
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#2563eb"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No client revenue data available
                    </p>
                  )}
                </div>
                {/* Revenue by Plan */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Revenue by Pricing Plan
                  </h2>
                  {revenueByPlan.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={revenueByPlan}
                            dataKey="revenue"
                            nameKey="plan"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={3}
                          >
                            {revenueByPlan.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  [
                                    "#2563eb",
                                    "#7c3aed",
                                    "#059669",
                                    "#d97706",
                                    "#dc2626",
                                  ][index % 5]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number | undefined) => [
                              formatCurrency(value ?? 0),
                              "Revenue",
                            ]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "12px",
                            }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingTop: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {revenueByPlan.map((plan, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">{plan.plan}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500">
                                {plan.count.toLocaleString()} sessions
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(plan.revenue)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No plan revenue data available
                    </p>
                  )}
                </div>
              </div>

              {/* Withdrawals Section */}
              <div className="mt-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Client Withdrawals
                </h2>

                {/* Withdrawal summary cards */}
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <p className="text-sm font-medium text-gray-500">
                      Total Withdrawn (All Time)
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(totalWithdrawn)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-100 bg-orange-50 p-5">
                    <p className="text-sm font-medium text-orange-600">
                      Pending / Processing ({pendingWithdrawalCount})
                    </p>
                    <p className="mt-1 text-2xl font-bold text-orange-700">
                      {formatCurrency(pendingWithdrawals)}
                    </p>
                  </div>
                </div>

                {/* Withdrawal table */}
                {recentWithdrawals.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Client
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Method
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentWithdrawals
                          .slice(
                            withdrawalsPage * WITHDRAWALS_PAGE_SIZE,
                            (withdrawalsPage + 1) * WITHDRAWALS_PAGE_SIZE,
                          )
                          .map((w) => (
                            <tr key={w._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {w.clientName || "—"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                UGX {w.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {w.payoutMethod === "mobile_money"
                                  ? "Mobile Money"
                                  : "Bank"}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {w.payoutMethod === "mobile_money"
                                  ? w.payoutDetails.phone
                                  : `${w.payoutDetails.bankName ?? ""} – ${w.payoutDetails.bankAccountNumber ?? ""}`}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    w.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : w.status === "failed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {w.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {new Date(w.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                {(w.status === "pending" ||
                                  w.status === "processing") && (
                                  <button
                                    onClick={() =>
                                      handleMarkWithdrawalComplete(w._id)
                                    }
                                    disabled={updatingWithdrawal === w._id}
                                    className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {updatingWithdrawal === w._id
                                      ? "Updating..."
                                      : "Mark complete"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {recentWithdrawals.length > WITHDRAWALS_PAGE_SIZE && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <button
                          onClick={() =>
                            setWithdrawalsPage((p) => Math.max(0, p - 1))
                          }
                          disabled={withdrawalsPage === 0}
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-500">
                          Page {withdrawalsPage + 1} of{" "}
                          {Math.ceil(
                            recentWithdrawals.length / WITHDRAWALS_PAGE_SIZE,
                          )}{" "}
                          ({recentWithdrawals.length} total)
                        </span>
                        <button
                          onClick={() =>
                            setWithdrawalsPage((p) =>
                              Math.min(
                                Math.ceil(
                                  recentWithdrawals.length /
                                    WITHDRAWALS_PAGE_SIZE,
                                ) - 1,
                                p + 1,
                              ),
                            )
                          }
                          disabled={
                            (withdrawalsPage + 1) * WITHDRAWALS_PAGE_SIZE >=
                            recentWithdrawals.length
                          }
                          className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <p className="text-gray-500 text-sm">
                      No withdrawal requests yet
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Admin Withdraw Modal */}
      {showAdminWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {adminWithdrawStep === "form" && (
              <>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Withdraw Platform Revenue
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Available:{" "}
                      <span className="font-semibold text-indigo-600">
                        UGX {adminWithdrawableBalance.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAdminWithdrawModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {adminWithdrawError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {adminWithdrawError}
                  </div>
                )}

                {/* Amount */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Amount (UGX)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={adminWithdrawAmount}
                      onChange={(e) => setAdminWithdrawAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      min={1000}
                      max={adminWithdrawableBalance}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        setAdminWithdrawAmount(String(adminWithdrawableBalance))
                      }
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                    >
                      All
                    </button>
                  </div>
                </div>

                {/* Method */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Payout Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["mobile_money", "Mobile Money"],
                        ["bank", "Bank Transfer"],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setAdminWithdrawMethod(val)}
                        className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                          adminWithdrawMethod === val
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile money fields */}
                {adminWithdrawMethod === "mobile_money" && (
                  <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone Number (Uganda)
                    </label>
                    <input
                      type="tel"
                      value={adminWithdrawPhone}
                      onChange={(e) => setAdminWithdrawPhone(e.target.value)}
                      placeholder="256701234567"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Bank fields */}
                {adminWithdrawMethod === "bank" && (
                  <div className="mb-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Bank Code
                      </label>
                      <input
                        type="text"
                        value={adminWithdrawBankName}
                        onChange={(e) =>
                          setAdminWithdrawBankName(e.target.value)
                        }
                        placeholder="e.g. STANBIC_BANK"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={adminWithdrawAccNum}
                        onChange={(e) => setAdminWithdrawAccNum(e.target.value)}
                        placeholder="e.g. 9030012345678"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={adminWithdrawAccName}
                        onChange={(e) =>
                          setAdminWithdrawAccName(e.target.value)
                        }
                        placeholder="Account holder name"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Note */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={adminWithdrawNote}
                    onChange={(e) => setAdminWithdrawNote(e.target.value)}
                    placeholder="e.g. Q1 revenue withdrawal"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAdminWithdrawModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const amt = Number(adminWithdrawAmount);
                      if (!amt || amt < 1000) {
                        setAdminWithdrawError(
                          "Minimum withdrawal is UGX 1,000",
                        );
                        return;
                      }
                      if (amt > adminWithdrawableBalance) {
                        setAdminWithdrawError(
                          "Amount exceeds available balance",
                        );
                        return;
                      }
                      if (
                        adminWithdrawMethod === "mobile_money" &&
                        !/^256[0-9]{9}$/.test(adminWithdrawPhone)
                      ) {
                        setAdminWithdrawError(
                          "Enter a valid Uganda number: 256XXXXXXXXX",
                        );
                        return;
                      }
                      if (
                        adminWithdrawMethod === "bank" &&
                        (!adminWithdrawBankName ||
                          !adminWithdrawAccNum ||
                          !adminWithdrawAccName)
                      ) {
                        setAdminWithdrawError("All bank fields are required");
                        return;
                      }
                      setAdminWithdrawError("");
                      setAdminWithdrawStep("confirm");
                    }}
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {adminWithdrawStep === "confirm" && (
              <>
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  Confirm Withdrawal
                </h2>
                <div className="mb-5 rounded-xl bg-gray-50 p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-900">
                      UGX {Number(adminWithdrawAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-semibold text-gray-900">
                      {adminWithdrawMethod === "mobile_money"
                        ? "Mobile Money"
                        : "Bank Transfer"}
                    </span>
                  </div>
                  {adminWithdrawMethod === "mobile_money" ? (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-semibold text-gray-900">
                        {adminWithdrawPhone}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank</span>
                        <span className="font-semibold text-gray-900">
                          {adminWithdrawBankName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account</span>
                        <span className="font-semibold text-gray-900">
                          {adminWithdrawAccNum}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name</span>
                        <span className="font-semibold text-gray-900">
                          {adminWithdrawAccName}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {adminWithdrawError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {adminWithdrawError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setAdminWithdrawStep("form")}
                    disabled={adminWithdrawLoading}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    disabled={adminWithdrawLoading}
                    onClick={async () => {
                      if (!token) return;
                      setAdminWithdrawLoading(true);
                      setAdminWithdrawError("");
                      try {
                        const result = await revenueAPI.withdraw(token, {
                          amount: Number(adminWithdrawAmount),
                          payoutMethod: adminWithdrawMethod,
                          payoutDetails:
                            adminWithdrawMethod === "mobile_money"
                              ? { phone: adminWithdrawPhone }
                              : {
                                  bankName: adminWithdrawBankName,
                                  bankAccountNumber: adminWithdrawAccNum,
                                  accountName: adminWithdrawAccName,
                                },
                          note: adminWithdrawNote || undefined,
                        });
                        if (result.success) {
                          setAdminWithdrawableBalance((b) =>
                            Math.max(0, b - Number(adminWithdrawAmount)),
                          );
                          setAdminWithdrawStep("done");
                        } else {
                          setAdminWithdrawError(
                            result.message || "Withdrawal failed",
                          );
                        }
                      } catch {
                        setAdminWithdrawError("Network error. Please retry.");
                      } finally {
                        setAdminWithdrawLoading(false);
                      }
                    }}
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {adminWithdrawLoading
                      ? "Processing..."
                      : "Confirm Withdraw"}
                  </button>
                </div>
              </>
            )}

            {adminWithdrawStep === "done" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-7 w-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">
                  Withdrawal Initiated
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  UGX {Number(adminWithdrawAmount).toLocaleString()} has been
                  sent via{" "}
                  {adminWithdrawMethod === "mobile_money"
                    ? "Mobile Money"
                    : "Bank Transfer"}
                  .
                </p>
                <button
                  onClick={() => setShowAdminWithdrawModal(false)}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
