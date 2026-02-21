"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { adsAPI } from "@/services/api";
import type { Ad, AdStats, AdLocation } from "@/types";

export default function AdsPage() {
  return (
    <ProtectedRoute>
      <AdsContent />
    </ProtectedRoute>
  );
}

function AdsContent() {
  const { token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [locations, setLocations] = useState<AdLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingAd, setDeletingAd] = useState<Ad | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "image" as "image" | "video",
    mediaSource: "url" as "url" | "upload",
    mediaUrl: "",
    linkUrl: "",
    locationId: "global",
    status: "active",
    priority: 0,
    startDate: "",
    endDate: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const [adsRes, statsRes, locsRes] = await Promise.all([
        adsAPI.getAll(token, { status: statusFilter, type: typeFilter }),
        adsAPI.getStats(token),
        adsAPI.getLocations(token),
      ]);
      if (adsRes.success) setAds(adsRes.ads);
      if (statsRes.success) setStats(statsRes.stats);
      if (locsRes.success) setLocations(locsRes.locations);
    } catch {
      setError("Failed to load ads data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, typeFilter]);

  const resetForm = () => {
    setFormData({
      title: "",
      type: "image",
      mediaSource: "url",
      mediaUrl: "",
      linkUrl: "",
      locationId: "global",
      status: "active",
      priority: 0,
      startDate: "",
      endDate: "",
    });
    setMediaFile(null);
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateModal = () => {
    resetForm();
    setEditingAd(null);
    setShowCreateModal(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      type: ad.type,
      mediaSource: ad.mediaUrl.startsWith("/uploads/") ? "upload" : "url",
      mediaUrl: ad.mediaUrl.startsWith("/uploads/") ? "" : ad.mediaUrl,
      linkUrl: ad.linkUrl || "",
      locationId: ad.locationId?._id || "global",
      status: ad.status,
      priority: ad.priority,
      startDate: ad.startDate ? ad.startDate.slice(0, 10) : "",
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : "",
    });
    setMediaFile(null);
    setFormError("");
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("type", formData.type);
      fd.append("linkUrl", formData.linkUrl);
      fd.append("locationId", formData.locationId);
      fd.append("status", formData.status);
      fd.append("priority", String(formData.priority));
      if (formData.startDate) fd.append("startDate", formData.startDate);
      if (formData.endDate) fd.append("endDate", formData.endDate);

      if (formData.mediaSource === "upload" && mediaFile) {
        fd.append("media", mediaFile);
      } else if (formData.mediaSource === "url" && formData.mediaUrl) {
        fd.append("mediaUrl", formData.mediaUrl);
      } else if (!editingAd) {
        setFormError("Please provide media (upload a file or enter a URL)");
        setIsSubmitting(false);
        return;
      }

      let result;
      if (editingAd) {
        result = await adsAPI.update(token, editingAd._id, fd);
      } else {
        result = await adsAPI.create(token, fd);
      }

      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        setFormError(result.message || "Failed to save ad");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (ad: Ad) => {
    if (!token) return;
    const result = await adsAPI.toggle(token, ad._id);
    if (result.success) fetchData();
  };

  const handleDelete = async () => {
    if (!token || !deletingAd) return;
    const result = await adsAPI.delete(token, deletingAd._id);
    if (result.success) {
      setShowDeleteModal(false);
      setDeletingAd(null);
      fetchData();
    }
  };

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:3000";

  const getMediaPreviewUrl = (ad: Ad) => {
    if (ad.mediaUrl.startsWith("/uploads/")) {
      return `${apiBase}${ad.mediaUrl}`;
    }
    return ad.mediaUrl;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Advertisements"
          subtitle="Manage ad banners across locations"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Advertisements
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage ads displayed on WiFi captive portal pages
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Ad
              </button>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium text-gray-500">Total Ads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold text-gray-400">
                    {stats.inactive}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Impressions
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalImpressions.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium text-gray-500">Clicks</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Types</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Ads Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <svg
                  className="h-8 w-8 animate-spin text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : ads.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  No advertisements yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first ad to display on captive portal pages.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Ad
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impressions
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {ads.map((ad) => (
                      <tr key={ad._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="h-12 w-20 overflow-hidden rounded bg-gray-100">
                            {ad.type === "image" ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={getMediaPreviewUrl(ad)}
                                alt={ad.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='48' fill='%23ddd'%3E%3Crect width='80' height='48'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-purple-50">
                                <svg
                                  className="h-6 w-6 text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {ad.title}
                          </div>
                          {ad.linkUrl && (
                            <div className="text-xs text-gray-400 truncate max-w-50">
                              {ad.linkUrl}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              ad.type === "image"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {ad.type === "image" ? "🖼 Image" : "🎬 Video"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ad.locationId ? ad.locationId.name : "All Locations"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggle(ad)}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors ${
                              ad.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {ad.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ad.impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ad.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(ad)}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setDeletingAd(ad);
                                setShowDeleteModal(true);
                              }}
                              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAd ? "Edit Ad" : "Create New Ad"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
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

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Summer Sale Banner"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Ad Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "image" })}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                      formData.type === "image"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🖼 Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "video" })}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                      formData.type === "video"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🎬 Video
                  </button>
                </div>
              </div>

              {/* Media Source */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Media Source <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, mediaSource: "url" })
                    }
                    className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      formData.mediaSource === "url"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    External URL
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, mediaSource: "upload" })
                    }
                    className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      formData.mediaSource === "upload"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {formData.mediaSource === "url" ? (
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, mediaUrl: e.target.value })
                    }
                    placeholder="https://example.com/banner.jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        formData.type === "image"
                          ? "image/jpeg,image/png,image/gif,image/webp"
                          : "video/mp4,video/webm,video/ogg"
                      }
                      onChange={(e) =>
                        setMediaFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {editingAd && !mediaFile && (
                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty to keep current media
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Click-through URL{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Target Location
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) =>
                    setFormData({ ...formData, locationId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="global">All Locations (Global)</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name} — {loc.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Higher = shown first
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Start Date <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    End Date <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingAd
                      ? "Update Ad"
                      : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Ad</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete &ldquo;{deletingAd.title}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingAd(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
