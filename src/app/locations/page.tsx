"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import type { Location } from "@/types";
import { locationsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline" | "error"
  >("all");
  const [routerFilter, setRouterFilter] = useState<
    "all" | "MikroTik" | "OpenWRT" | "Ubiquiti"
  >("all");

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { token } = useAuth();

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await locationsAPI.getAll(token);

        if (response.success) {
          setLocations(response.locations || []);
        } else {
          setError(response.message || "Failed to fetch locations");
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("Failed to load locations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [token]);

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

  const handleViewDetails = (location: Location) => {
    setSelectedLocation(location);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedLocation(null);
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
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading locations...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">
                    Error Loading Locations
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatsCard
                  label="Total Locations"
                  value={stats.total}
                  variant="default"
                />
                <StatsCard
                  label="Online"
                  value={stats.online}
                  variant="success"
                  showIndicator
                />
                <StatsCard
                  label="Offline"
                  value={stats.offline}
                  variant="warning"
                />
                <StatsCard
                  label="Errors"
                  value={stats.error}
                  variant="danger"
                />
              </div>

              {/* Filters */}
              <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by location, client, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as typeof statusFilter)
                    }
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <button
                              onClick={() => handleViewDetails(location)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
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
            </>
          )}
        </main>
      </div>

      {/* Location Details Modal */}
      {showDetailsModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Location Details
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Complete information about this location
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedLocation.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLocation.status)}`}
                  >
                    {selectedLocation.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Created:{" "}
                  {new Date(selectedLocation.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">
                  Location Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Location Name
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLocation.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Location ID
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                      {selectedLocation.id}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Address
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedLocation.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">
                  Client Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Business Name
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLocation.clientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Client ID
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                      {selectedLocation.clientId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Router Configuration */}
              <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">
                  Router Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Router Type
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                      {selectedLocation.routerType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Router IP
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                      {(selectedLocation as Location & { routerIp?: string })
                        .routerIp || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">
                  Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Active Sessions
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedLocation.activeSessions}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedLocation.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {getStatusIcon(selectedLocation.status)}
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {selectedLocation.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors">
                  Manage Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
