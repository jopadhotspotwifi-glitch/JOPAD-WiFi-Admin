"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { statsAPI, revenueAPI } from "@/services/api";
import type { PlatformStats, ClientActivity, RevenueData } from "@/types";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  // State for stats - initialize with zeros
  const [stats, setStats] = useState<PlatformStats>({
    totalClients: 0,
    activeClients: 0,
    totalLocations: 0,
    activeSessions: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ClientActivity[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [currentTime] = useState(() => Date.now());

  // Fetch real stats, revenue trend, and activity from API
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      try {
        setLoading(true);
        const [statsRes, revenueRes, activityRes] = await Promise.all([
          statsAPI.get(token),
          revenueAPI.get(token, "7d"),
          statsAPI.getActivity(token),
        ]);

        if (statsRes.success && statsRes.stats) {
          setStats(statsRes.stats);
          setError(null);
        } else {
          setError(statsRes.message || "Failed to fetch statistics");
        }

        if (revenueRes.success && revenueRes.revenue) {
          setRevenueTrend(revenueRes.revenue.trend);
        }

        if (activityRes.success) {
          setRecentActivity(activityRes.activity);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `UGX ${(amount / 1000).toFixed(0)}K`;
  };

  const formatTimeAgo = (date: Date | string) => {
    const ms =
      typeof date === "string" ? new Date(date).getTime() : date.getTime();
    const minutes = Math.floor((currentTime - ms) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Platform overview and key metrics"
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Clients"
                  value={stats.totalClients}
                  icon={
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }
                  subtitle={`${stats.activeClients} active`}
                  trend={{ value: 12.3, isPositive: true }}
                />

                <StatCard
                  title="Total Locations"
                  value={stats.totalLocations}
                  icon={
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  trend={{ value: 8.7, isPositive: true }}
                />

                <StatCard
                  title="Active Sessions"
                  value={stats.activeSessions}
                  icon={
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                  }
                  subtitle="Real-time"
                />

                <StatCard
                  title="Today's Revenue"
                  value={formatCurrency(stats.todayRevenue)}
                  icon={
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                  }
                  trend={{ value: stats.revenueGrowth, isPositive: true }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-gray-100 rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      7-Day Revenue
                    </h2>
                    <span className="text-sm text-gray-500">Last 7 days</span>
                  </div>
                  {revenueTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={256}>
                      <BarChart
                        data={revenueTrend}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#d1d5db"
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
                          width={72}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
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
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                      No revenue data available yet
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h2>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.clientName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {activity.action}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {activity.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Monthly Revenue
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
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.monthlyRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    +{stats.revenueGrowth}% from last month
                  </p>
                </div>

                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6">
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
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">
                      Active Rate
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalClients > 0
                      ? (
                          (stats.activeClients / stats.totalClients) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.activeClients} of {stats.totalClients} clients
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
