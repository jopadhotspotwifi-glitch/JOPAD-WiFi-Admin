"use client";

import { useState, useEffect } from "react";
import {
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
import { analyticsAPI } from "@/services/api";
import type {
  SessionByPlan,
  TopLocation,
  DeviceStat,
  HourlyTraffic,
} from "@/types";

const periodMap: Record<string, string> = {
  "7days": "7d",
  "30days": "30d",
  "90days": "90d",
};

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">(
    "30days",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [sessionsByPlan, setSessionsByPlan] = useState<SessionByPlan[]>([]);
  const [topLocations, setTopLocations] = useState<TopLocation[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyTraffic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);
      setError("");
      try {
        const res = await analyticsAPI.get(token, periodMap[timeRange]);
        if (res.success && res.analytics) {
          setSessionsByPlan(res.analytics.sessionsByPlan);
          setTopLocations(res.analytics.topLocations);
          setDeviceStats(res.analytics.deviceStats);
          setHourlyData(res.analytics.hourlyData);
        } else {
          setError("Failed to load analytics data");
        }
      } catch {
        setError("Failed to load analytics data");
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Analytics"
          subtitle="Platform-wide insights and performance metrics"
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
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading analytics...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading &&
            !error &&
            sessionsByPlan.length === 0 &&
            topLocations.length === 0 && (
              <div className="text-center py-20">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No analytics data yet
                </h3>
                <p className="text-gray-500 text-sm">
                  Analytics will appear here once sessions and payments are
                  recorded.
                </p>
              </div>
            )}

          {!isLoading && !error && sessionsByPlan.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sessions by Plan */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Sessions by Plan
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={sessionsByPlan}
                        dataKey="sessions"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={3}
                      >
                        {sessionsByPlan.map((_entry, index) => (
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
                        formatter={(value: number, name: string) => [
                          value.toLocaleString(),
                          name === "sessions" ? "Sessions" : name,
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
                        wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {sessionsByPlan.map((plan, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">{plan.plan}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(plan.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Device Distribution
                  </h2>
                  {deviceStats.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={deviceStats}
                            dataKey="count"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={3}
                          >
                            {deviceStats.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  ["#2563eb", "#7c3aed", "#059669", "#d97706"][
                                    index % 4
                                  ]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [
                              value.toLocaleString(),
                              "Devices",
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
                      <div className="mt-2 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          Total Devices:{" "}
                          <span className="font-semibold text-gray-900">
                            {deviceStats
                              .reduce((acc, d) => acc + d.count, 0)
                              .toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No device data available
                    </p>
                  )}
                </div>
              </div>

              {/* Hourly Traffic Pattern */}
              {hourlyData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Hourly Traffic Pattern
                  </h2>
                  <ResponsiveContainer width="100%" height={192}>
                    <BarChart
                      data={hourlyData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          value.toLocaleString(),
                          "Sessions",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="sessions"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Performing Locations */}
              {topLocations.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Top Performing Locations
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sessions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topLocations.map((location, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  index === 0
                                    ? "bg-yellow-100 text-yellow-700"
                                    : index === 1
                                      ? "bg-gray-100 text-gray-700"
                                      : index === 2
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-blue-50 text-blue-600"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">
                                {location.name}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                {location.client}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                {location.sessions.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(location.revenue)}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
