"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { revenueAPI } from "@/services/api";
import type { RevenueData, RevenueByClient, RevenueByPlan } from "@/types";

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

  const maxRevenue = Math.max(...revenueTrend.map((m) => m.revenue), 1);

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
                  <div className="flex items-end justify-between gap-4 h-72">
                    {revenueTrend.map((data, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-3"
                      >
                        <div className="w-full bg-gray-100 rounded-t flex items-end justify-center relative group">
                          <div
                            className="w-full bg-linear-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                            style={{
                              height: `${(data.revenue / maxRevenue) * 260}px`,
                            }}
                          >
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              <p className="font-semibold">
                                {formatCurrency(data.revenue)}
                              </p>
                              <p className="text-gray-300">
                                {data.sessions.toLocaleString()} sessions
                              </p>
                              <p className="text-gray-300">
                                {data.clients} clients
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {data.date}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(data.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                {/* Revenue by Client */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Top Clients by Revenue
                  </h2>
                  {revenueByClient.length > 0 ? (
                    <div className="space-y-4">
                      {revenueByClient.map((client, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {client.clientName}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(client.revenue)}
                                </span>
                                <span
                                  className={`text-xs font-medium ${client.trend > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {client.trend > 0 ? "+" : ""}
                                  {client.trend}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${client.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <div className="space-y-4">
                      {revenueByPlan.map((plan, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {plan.plan}
                            </h3>
                            <span className="text-lg font-bold text-blue-600">
                              {formatCurrency(plan.revenue)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Sessions</p>
                              <p className="font-medium text-gray-900">
                                {plan.count.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Avg/Session</p>
                              <p className="font-medium text-gray-900">
                                {formatCurrency(plan.avg)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No plan revenue data available
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
