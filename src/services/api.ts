import type { SystemSettings } from "@/types";

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
};
