"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import type { RevenueData } from "@/types";

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState<
    "7days" | "30days" | "90days" | "year"
  >("30days");

  const [monthlyRevenue] = useState<RevenueData[]>(() => [
    { date: "Jan", revenue: 42500000, sessions: 12340, clients: 215 },
    { date: "Feb", revenue: 38900000, sessions: 11250, clients: 221 },
    { date: "Mar", revenue: 45200000, sessions: 13100, clients: 228 },
    { date: "Apr", revenue: 48700000, sessions: 14200, clients: 235 },
    { date: "May", revenue: 52300000, sessions: 15300, clients: 242 },
    { date: "Jun", revenue: 49800000, sessions: 14560, clients: 248 },
  ]);

  const [revenueByClient] = useState(() => [
    {
      clientName: "Airport Lounge Network",
      revenue: 12800000,
      percentage: 18.5,
      trend: 12.3,
    },
    {
      clientName: "Mall WiFi Services",
      revenue: 8900000,
      percentage: 12.8,
      trend: 8.7,
    },
    {
      clientName: "City Restaurant Group",
      revenue: 6700000,
      percentage: 9.7,
      trend: 15.2,
    },
    {
      clientName: "Downtown Cafe WiFi",
      revenue: 4500000,
      percentage: 6.5,
      trend: -3.4,
    },
    {
      clientName: "Beach Resort WiFi",
      revenue: 3200000,
      percentage: 4.6,
      trend: 22.1,
    },
  ]);

  const [revenueByPlan] = useState(() => [
    { plan: "Premium", revenue: 58500000, count: 2340, avg: 25000 },
    { plan: "All Day", revenue: 43350000, count: 2890, avg: 15000 },
    { plan: "Standard", revenue: 19440000, count: 3240, avg: 6000 },
    { plan: "Quick Browse", revenue: 13740000, count: 4580, avg: 3000 },
  ]);

  const totalRevenue = monthlyRevenue.reduce((acc, m) => acc + m.revenue, 0);
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`;
    }
    return `UGX ${(amount / 1000).toFixed(0)}K`;
  };

  const platformFee = 0.15; // 15% platform fee
  const platformRevenue = totalRevenue * platformFee;
  const clientRevenue = totalRevenue * (1 - platformFee);

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
              <p className="text-xs text-gray-500 mt-2">Last 6 months</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Platform Revenue (15%)
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
                  Client Revenue (85%)
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue Trend
              </h2>
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
            <div className="flex items-end justify-between gap-4 h-72">
              {monthlyRevenue.map((data, index) => (
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
                        <p className="text-gray-300">{data.clients} clients</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Client */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Top Clients by Revenue
              </h2>
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
            </div>

            {/* Revenue by Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Revenue by Pricing Plan
              </h2>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
