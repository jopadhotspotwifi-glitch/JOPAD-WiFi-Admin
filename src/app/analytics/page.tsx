"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">(
    "30days",
  );

  const [sessionsByPlan] = useState(() => [
    { plan: "Quick Browse", sessions: 4580, revenue: 13740000, percentage: 35 },
    { plan: "Standard", sessions: 3240, revenue: 19440000, percentage: 25 },
    { plan: "All Day", sessions: 2890, revenue: 43350000, percentage: 22 },
    { plan: "Premium", sessions: 2340, revenue: 58500000, percentage: 18 },
  ]);

  const [topLocations] = useState(() => [
    {
      name: "Departure Lounge 1",
      client: "Airport Lounge Network",
      sessions: 2340,
      revenue: 9850000,
    },
    {
      name: "Food Court",
      client: "Mall WiFi Services",
      sessions: 1890,
      revenue: 7200000,
    },
    {
      name: "Main Branch",
      client: "Downtown Cafe WiFi",
      sessions: 1650,
      revenue: 6500000,
    },
    {
      name: "Departure Lounge 2",
      client: "Airport Lounge Network",
      sessions: 1520,
      revenue: 6100000,
    },
    {
      name: "Downtown Restaurant",
      client: "City Restaurant Group",
      sessions: 1340,
      revenue: 5300000,
    },
  ]);

  const [deviceStats] = useState(() => [
    { type: "Mobile", count: 8450, percentage: 58 },
    { type: "Laptop", count: 4230, percentage: 29 },
    { type: "Tablet", count: 1890, percentage: 13 },
  ]);

  const [hourlyData] = useState(() => [
    { hour: "00:00", sessions: 45 },
    { hour: "03:00", sessions: 32 },
    { hour: "06:00", sessions: 78 },
    { hour: "09:00", sessions: 156 },
    { hour: "12:00", sessions: 234 },
    { hour: "15:00", sessions: 198 },
    { hour: "18:00", sessions: 176 },
    { hour: "21:00", sessions: 134 },
  ]);

  const maxHourly = Math.max(...hourlyData.map((d) => d.sessions));

  const formatCurrency = (amount: number) => {
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sessions by Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Sessions by Plan
              </h2>
              <div className="space-y-4">
                {sessionsByPlan.map((plan, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {plan.plan}
                        </p>
                        <p className="text-xs text-gray-500">
                          {plan.sessions.toLocaleString()} sessions
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(plan.revenue)}
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${plan.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Device Distribution
              </h2>
              <div className="space-y-6">
                {deviceStats.map((device, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="shrink-0 w-20 text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {device.percentage}%
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {device.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {device.count.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            index === 0
                              ? "bg-blue-600"
                              : index === 1
                                ? "bg-purple-600"
                                : "bg-green-600"
                          }`}
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Total Devices:{" "}
                  <span className="font-semibold text-gray-900">
                    {deviceStats
                      .reduce((acc, d) => acc + d.count, 0)
                      .toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Hourly Traffic Pattern */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Hourly Traffic Pattern
            </h2>
            <div className="flex items-end justify-between gap-4 h-48">
              {hourlyData.map((data, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full bg-gray-100 rounded-t flex items-end justify-center relative group">
                    <div
                      className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700 cursor-pointer"
                      style={{
                        height: `${(data.sessions / maxHourly) * 180}px`,
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.sessions} sessions
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{data.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Locations */}
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
        </main>
      </div>
    </div>
  );
}
