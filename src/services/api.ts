import type {
  SystemSettings,
  Ad,
  AdStats,
  AdLocation,
  AnalyticsData,
  RevenueAnalytics,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: {
    email: string;
    createdAt: string;
  };
}

interface VerifyTokenResponse {
  success: boolean;
  message: string;
  admin?: {
    email: string;
    adminId: string;
  };
}

export const authAPI = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  },

  /**
   * Verify JWT token
   */
  verifyToken: async (token: string): Promise<VerifyTokenResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to verify token",
        }));
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error during token verification:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  },

  /**
   * Request OTP for login
   */
  requestOTP: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    return data;
  },

  /**
   * Change admin password
   */
  changePassword: async (
    token: string,
    currentPassword: string,
    newPassword: string,
  ) => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    return data;
  },
};

export const locationsAPI = {
  /**
   * Get all locations across all clients
   */
  getAll: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/locations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  },

  /**
   * Get location statistics
   */
  getStats: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/locations/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  },

  /**
   * Get a single location by ID
   */
  getById: async (token: string, locationId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/locations/${locationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return data;
  },
};

export const settingsAPI = {
  /**
   * Get current platform settings
   */
  get: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to fetch settings",
        }));
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error fetching settings:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  },

  /**
   * Update platform settings
   */
  update: async (token: string, settings: Partial<SystemSettings>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to update settings",
        }));
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error updating settings:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  },

  /**
   * Partially update settings (for toggles)
   */
  patch: async (token: string, updates: Partial<SystemSettings>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to update settings",
        }));
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error updating settings:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  },

  /**
   * Reset settings to default values
   */
  reset: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to reset settings",
        }));
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error resetting settings:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  },
};

export const statsAPI = {
  /**
   * Get platform statistics for admin dashboard
   */
  get: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to fetch statistics",
        }));
        return errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error fetching statistics:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  },

  /**
   * Get recent platform activity (clients, locations, payments)
   */
  getActivity: async (
    token: string,
  ): Promise<{
    success: boolean;
    activity: import("@/types").ClientActivity[];
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats/activity`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { success: false, activity: [] };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error fetching activity:", error);
      return { success: false, activity: [] };
    }
  },
};

export const adsAPI = {
  /**
   * Get all ads with optional filters
   */
  getAll: async (
    token: string,
    filters?: { status?: string; type?: string; locationId?: string },
  ): Promise<{ success: boolean; ads: Ad[]; count: number }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.locationId) params.set("locationId", filters.locationId);

      const response = await fetch(
        `${API_BASE_URL}/admin/ads?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching ads:", error);
      return { success: false, ads: [], count: 0 };
    }
  },

  /**
   * Get ad statistics
   */
  getStats: async (
    token: string,
  ): Promise<{ success: boolean; stats: AdStats }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching ad stats:", error);
      return {
        success: false,
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          totalImpressions: 0,
          totalClicks: 0,
        },
      };
    }
  },

  /**
   * Get a single ad by ID
   */
  getById: async (
    token: string,
    adId: string,
  ): Promise<{ success: boolean; ad: Ad }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/${adId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching ad:", error);
      return { success: false, ad: {} as Ad };
    }
  },

  /**
   * Create a new ad — supports FormData (file upload) or JSON (external URL)
   */
  create: async (
    token: string,
    data: FormData,
  ): Promise<{ success: boolean; ad?: Ad; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating ad:", error);
      return { success: false, message: "Network error" };
    }
  },

  /**
   * Update an ad
   */
  update: async (
    token: string,
    adId: string,
    data: FormData,
  ): Promise<{ success: boolean; ad?: Ad; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/${adId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating ad:", error);
      return { success: false, message: "Network error" };
    }
  },

  /**
   * Toggle ad active/inactive
   */
  toggle: async (
    token: string,
    adId: string,
  ): Promise<{ success: boolean; ad?: Ad }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/${adId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error toggling ad:", error);
      return { success: false };
    }
  },

  /**
   * Delete an ad
   */
  delete: async (
    token: string,
    adId: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/${adId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting ad:", error);
      return { success: false, message: "Network error" };
    }
  },

  /**
   * Bulk-update ad priorities after drag-and-drop reorder
   */
  reorder: async (
    token: string,
    order: { id: string; priority: number }[],
  ): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error reordering ads:", error);
      return { success: false };
    }
  },

  /**
   * Get all locations for dropdown
   */
  getLocations: async (
    token: string,
  ): Promise<{ success: boolean; locations: AdLocation[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ads/locations/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching locations:", error);
      return { success: false, locations: [] };
    }
  },
};

export const analyticsAPI = {
  /**
   * Get platform-wide analytics data
   */
  get: async (
    token: string,
    period: string = "30d",
  ): Promise<{ success: boolean; analytics: AnalyticsData }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/analytics?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to fetch analytics",
        }));
        return errorData;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        success: false,
        analytics: {
          sessionsByPlan: [],
          topLocations: [],
          deviceStats: [],
          hourlyData: [],
        },
      };
    }
  },
};

export const revenueAPI = {
  /**
   * Get platform-wide revenue analytics
   */
  get: async (
    token: string,
    period: string = "30d",
  ): Promise<{ success: boolean; revenue: RevenueAnalytics }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/revenue?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: "Failed to fetch revenue data",
        }));
        return errorData;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching revenue:", error);
      return {
        success: false,
        revenue: {
          totalRevenue: 0,
          platformRevenue: 0,
          clientRevenue: 0,
          revenueShare: 15,
          trend: [],
          byClient: [],
          byPlan: [],
        },
      };
    }
  },

  /**
   * Admin withdraws their accumulated platform cut via JulyPay
   */
  withdraw: async (
    token: string,
    data: {
      amount: number;
      payoutMethod: "mobile_money" | "bank";
      payoutDetails: {
        phone?: string;
        bankAccountNumber?: string;
        bankName?: string;
        accountName?: string;
      };
      note?: string;
    },
  ): Promise<{
    success: boolean;
    withdrawal?: object;
    status?: string;
    message?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/revenue/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Admin withdraw error:", error);
      return { success: false, message: "Network error" };
    }
  },
};
