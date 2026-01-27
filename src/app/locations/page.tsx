"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import type { Location } from "@/types";

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline" | "error"
  >("all");
  const [routerFilter, setRouterFilter] = useState<
    "all" | "MikroTik" | "OpenWRT" | "Ubiquiti"
  >("all");

  const [locations] = useState<Location[]>(() => [
    {
      id: "1",
      clientId: "c1",
      clientName: "Downtown Cafe WiFi",
      name: "Main Branch",
      address: "Kampala Road, Kampala",
      routerType: "MikroTik",
      status: "online",
      activeSessions: 12,
      totalRevenue: 1800000,
      createdAt: new Date("2025-01-15"),
    },
    {
      id: "2",
      clientId: "c1",
      clientName: "Downtown Cafe WiFi",
      name: "Airport Branch",
      address: "Entebbe Airport, Entebbe",
      routerType: "MikroTik",
      status: "online",
      activeSessions: 8,
      totalRevenue: 950000,
      createdAt: new Date("2025-01-18"),
    },
    {
      id: "3",
      clientId: "c2",
      clientName: "Airport Lounge Network",
      name: "Departure Lounge 1",
      address: "Terminal 1, Entebbe Airport",
      routerType: "Ubiquiti",
      status: "online",
      activeSessions: 25,
      totalRevenue: 3200000,
      createdAt: new Date("2024-11-20"),
    },
    {
      id: "4",
      clientId: "c2",
      clientName: "Airport Lounge Network",
      name: "Departure Lounge 2",
      address: "Terminal 2, Entebbe Airport",
      routerType: "Ubiquiti",
      status: "online",
      activeSessions: 20,
      totalRevenue: 2800000,
      createdAt: new Date("2024-11-20"),
    },
    {
      id: "5",
      clientId: "c3",
      clientName: "Mall WiFi Services",
      name: "Food Court",
      address: "Garden City Mall, Kampala",
      routerType: "OpenWRT",
      status: "online",
      activeSessions: 15,
      totalRevenue: 1500000,
      createdAt: new Date("2024-12-10"),
    },
    {
      id: "6",
      clientId: "c3",
      clientName: "Mall WiFi Services",
      name: "Shopping Area",
      address: "Garden City Mall, Kampala",
      routerType: "OpenWRT",
      status: "offline",
      activeSessions: 0,
      totalRevenue: 800000,
      createdAt: new Date("2024-12-10"),
    },
    {
      id: "7",
      clientId: "c4",
      clientName: "Hotel Paradise WiFi",
      name: "Lobby",
      address: "Hotel Paradise, Jinja",
      routerType: "MikroTik",
      status: "error",
      activeSessions: 0,
      totalRevenue: 600000,
      createdAt: new Date("2025-01-05"),
    },
    {
      id: "8",
      clientId: "c5",
      clientName: "City Restaurant Group",
      name: "Downtown Restaurant",
      address: "Acacia Avenue, Kampala",
      routerType: "Ubiquiti",
      status: "online",
      activeSessions: 6,
      totalRevenue: 1200000,
      createdAt: new Date("2024-10-18"),
    },
  ]);

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;
    const matchesRouter =
      routerFilter === "all" || location.routerType === routerFilter;
    return matchesSearch && matchesStatus && matchesRouter;
  });

  const formatCurrency = (amount: number) => {
    return `UGX ${(amount / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status: Location["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-700";
      case "offline":
        return "bg-gray-100 text-gray-700";
      case "error":
        return "bg-red-100 text-red-700";
    }
  };

  const getStatusIcon = (status: Location["status"]) => {
    switch (status) {
      case "online":
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        );
      case "offline":
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
      case "error":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    }
  };

  const stats = {
    total: locations.length,
    online: locations.filter((l) => l.status === "online").length,
    offline: locations.filter((l) => l.status === "offline").length,
    error: locations.filter((l) => l.status === "error").length,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Locations"
          subtitle="Monitor all WiFi locations across all clients"
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Online</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {stats.online}
                </p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Offline</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.offline}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by location, client, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="error">Error</option>
              </select>

              <select
                value={routerFilter}
                onChange={(e) =>
                  setRouterFilter(e.target.value as typeof routerFilter)
                }
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Routers</option>
                <option value="MikroTik">MikroTik</option>
                <option value="OpenWRT">OpenWRT</option>
                <option value="Ubiquiti">Ubiquiti</option>
              </select>
            </div>
          </div>

          {/* Locations Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Router
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLocations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {location.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {location.address}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {location.clientName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 font-mono">
                          {location.routerType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(location.status)}
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(location.status)}`}
                          >
                            {location.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {location.activeSessions}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(location.totalRevenue)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLocations.length === 0 && (
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                <p className="text-gray-500">
                  No locations found matching your criteria
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
