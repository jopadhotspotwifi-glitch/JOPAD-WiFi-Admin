"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AlertModal from "@/components/AlertModal";
import { useAuth } from "@/contexts/AuthContext";
import { clientsAPI, Client as APIClient } from "@/services/clients";

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsContent />
    </ProtectedRoute>
  );
}

function ClientsContent() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "inactive"
  >("all");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<APIClient | null>(null);
  const [clients, setClients] = useState<APIClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    status: "active" as APIClient["status"],
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    text: string;
    type: "success" | "warning";
  } | null>(null);
  const [isResendingCredentials, setIsResendingCredentials] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ isOpen: false, title: "", message: "", type: "error" });

  // Password reset state
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetStep, setResetStep] = useState<"send" | "verify">("send");
  const [resetOTP, setResetOTP] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Fetch clients
  const fetchClients = async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await clientsAPI.getAll(token, {
        status: statusFilter,
        search: searchTerm,
      });

      if (response.success) {
        setClients(response.clients);
      } else {
        setError("Failed to fetch clients");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    setCurrentPage(0);
    fetchClients();
  }, [token, statusFilter, searchTerm]);

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Don't submit if we're in details modal but not in editing mode
    if (showDetailsModal && !isEditing) {
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      let response;
      if (isEditing && selectedClient) {
        response = await clientsAPI.update(token, selectedClient._id, formData);
      } else {
        response = await clientsAPI.create(token, formData);
      }

      if (response.success) {
        setShowClientModal(false);
        setShowDetailsModal(false);
        setFormData({
          businessName: "",
          ownerName: "",
          email: "",
          phone: "",
          status: "active",
        });
        setIsEditing(false);
        setSelectedClient(null);
        fetchClients(); // Refresh the list
        // Show notification about email status
        const emailSent = (response as { emailSent?: boolean }).emailSent;
        if (!isEditing) {
          const notifText =
            emailSent === false
              ? response.message
              : "Client created successfully. Login credentials sent to their email.";
          setSuccessMessage({
            text: notifText,
            type: emailSent === false ? "warning" : "success",
          });
          setTimeout(() => setSuccessMessage(null), 8000);
        }
      } else {
        setFormError(
          response.message ||
            `Failed to ${isEditing ? "update" : "create"} client`,
        );
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view details
  const handleViewDetails = (client: APIClient) => {
    setSelectedClient(client);
    setFormData({
      businessName: client.businessName,
      ownerName: client.ownerName,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });
    setIsEditing(false);
    setShowDetailsModal(true);
  };

  // Handle edit mode
  const handleEditMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (client: APIClient) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!token || !selectedClient) return;

    setIsSubmitting(true);
    try {
      const response = await clientsAPI.delete(token, selectedClient._id);

      if (response.success) {
        setShowDeleteModal(false);
        setSelectedClient(null);
        fetchClients(); // Refresh the list
      } else {
        setAlertModal({
          isOpen: true,
          title: "Delete Failed",
          message: response.message || "Failed to delete client",
          type: "error",
        });
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Network Error",
        message: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend credentials
  const handleResendCredentials = async () => {
    if (!token || !selectedClient) return;
    setIsResendingCredentials(true);
    try {
      const response = await clientsAPI.resendCredentials(
        token,
        selectedClient._id,
      );
      if (response.success) {
        setShowDetailsModal(false);
        setSelectedClient(null);
        setSuccessMessage({
          text:
            response.message ||
            "Login credentials resent to client's email successfully.",
          type: "success",
        });
        setTimeout(() => setSuccessMessage(null), 8000);
      } else {
        setAlertModal({
          isOpen: true,
          title: "Resend Failed",
          message: response.message || "Failed to resend credentials",
          type: "error",
        });
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: "Network Error",
        message: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsResendingCredentials(false);
    }
  };

  // Handle password reset flow
  const handleOpenResetPassword = () => {
    setShowDetailsModal(false);
    setResetStep("send");
    setResetOTP("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetError("");
    setShowResetPasswordModal(true);
  };

  const handleSendResetOTP = async () => {
    if (!token || !selectedClient) return;
    setIsResettingPassword(true);
    setResetError("");

    try {
      const response = await clientsAPI.requestResetOTP(
        token,
        selectedClient._id,
      );
      if (response.success) {
        setResetStep("verify");
      } else {
        setResetError(response.message || "Failed to send OTP");
      }
    } catch {
      setResetError("Network error. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!token || !selectedClient) return;

    if (!resetOTP || resetOTP.length !== 6) {
      setResetError("Please enter the 6-digit OTP code.");
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setIsResettingPassword(true);
    setResetError("");

    try {
      const response = await clientsAPI.resetPassword(
        token,
        selectedClient._id,
        resetOTP,
        resetNewPassword,
      );
      if (response.success) {
        setShowResetPasswordModal(false);
        setSelectedClient(null);
        setSuccessMessage({
          text:
            "Password reset successfully for " +
            selectedClient.businessName +
            ".",
          type: "success",
        });
        setTimeout(() => setSuccessMessage(null), 8000);
      } else {
        setResetError(response.message || "Failed to reset password");
      }
    } catch {
      setResetError("Network error. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${(amount / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status: APIClient["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Clients"
          subtitle="Manage business clients and their subscriptions"
        />

        <main className="flex-1 px-8 py-4 overflow-y-auto">
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:max-w-md border border-gray-300 rounded-2xl focus-within:ring-1 focus-within:ring-blue-500">
                <input
                  type="text"
                  placeholder="Search by name, business, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border text-gray-600 border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as typeof statusFilter)
                  }
                  className="px-4 py-2 border text-gray-400 border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  onClick={() => {
                    setFormData({
                      businessName: "",
                      ownerName: "",
                      email: "",
                      phone: "",
                      status: "active",
                    });
                    setFormError("");
                    setShowClientModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Client
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Success / Warning Notification */}
          {successMessage && (
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-lg mb-4 border ${
                successMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              {/* <span className="text-lg mt-0.5">
                {successMessage.type === "success" ? "✅" : "⚠️"}
              </span> */}
              <p className="text-sm flex-1">{successMessage.text}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-current opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading clients...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Clients Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {clients
                  .slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
                  .map((client) => (
                    <div
                      key={client._id}
                      className="bg-gray-100 rounded-2xl border border-gray-300 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                            {client.ownerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {client.businessName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {client.ownerName}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(client.status)}`}
                              >
                                {client.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteClick(client)}
                          className="text-red-400 hover:text-red-600 hover:cursor-pointer p-1"
                          title="Delete client"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Locations
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {client.totalLocations}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Sessions</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {client.activeSessions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Revenue</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(client.totalRevenue)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">
                            {client.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {client.phone}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDetails(client)}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white hover:cursor-pointer rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {clients.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No clients found. Add your first client to get started.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {clients.length > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage + 1} of{" "}
                    {Math.ceil(clients.length / PAGE_SIZE)} ({clients.length}{" "}
                    total)
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(clients.length / PAGE_SIZE) - 1,
                          p + 1,
                        ),
                      )
                    }
                    disabled={(currentPage + 1) * PAGE_SIZE >= clients.length}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Client
              </h2>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-gray-600"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter business name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter owner name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+256700000000"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select className="w-full px-3 py-2 text-gray-500 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div> */}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false);
                    setFormError("");
                    setFormData({
                      businessName: "",
                      ownerName: "",
                      email: "",
                      phone: "",
                      status: "active",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Edit Client" : "Client Details"}
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setIsEditing(false);
                  setSelectedClient(null);
                  setFormError("");
                }}
                className="text-gray-400 hover:text-gray-600"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "text-gray-700"}`}
                    placeholder="Enter business name"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "text-gray-700"}`}
                    placeholder="Enter owner name"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "text-gray-700"}`}
                    placeholder="email@example.com"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "text-gray-700"}`}
                    placeholder="+256700000000"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as APIClient["status"],
                    })
                  }
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : "text-gray-700"}`}
                  disabled={!isEditing}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Statistics (Read-only) */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      Total Locations
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedClient.totalLocations}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      Active Sessions
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedClient.activeSessions}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedClient.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Client since:{" "}
                  {new Date(selectedClient.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedClient(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCredentials}
                      disabled={isResendingCredentials}
                      className="px-4 py-2 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      title="Generate a new password and resend login credentials to this client's email"
                    >
                      {isResendingCredentials
                        ? "Sending…"
                        : "Resend Credentials"}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenResetPassword}
                      className="px-4 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                      title="Send an OTP to the client's email and set a new password"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={handleEditMode}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Client
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          businessName: selectedClient.businessName,
                          ownerName: selectedClient.ownerName,
                          email: selectedClient.email,
                          phone: selectedClient.phone,
                          status: selectedClient.status,
                        });
                        setFormError("");
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Reset Password
              </h2>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedClient(null);
                }}
                className="text-gray-400 hover:text-gray-600"
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

            <p className="text-sm text-gray-600 mb-4">
              Resetting password for{" "}
              <span className="font-semibold text-gray-900">
                {selectedClient.businessName}
              </span>{" "}
              ({selectedClient.email})
            </p>

            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {resetError}
              </div>
            )}

            {resetStep === "send" ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    A 6-digit OTP will be sent to the client&apos;s email
                    address. You will then need to enter the OTP along with a
                    new password.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setSelectedClient(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendResetOTP}
                    disabled={isResettingPassword}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResettingPassword ? "Sending OTP…" : "Send OTP"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    OTP sent to {selectedClient.email}. Ask the client for the
                    code, then enter it below with the new password.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetOTP}
                    onChange={(e) =>
                      setResetOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-700 text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-700"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-700"
                    placeholder="Re-enter new password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSendResetOTP}
                    disabled={isResettingPassword}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPasswordSubmit}
                    disabled={isResettingPassword}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResettingPassword ? "Resetting…" : "Reset Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Client
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {selectedClient.businessName}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All associated data including locations and sessions will be
                permanently removed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedClient(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Deleting..." : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
