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
    const response = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
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
