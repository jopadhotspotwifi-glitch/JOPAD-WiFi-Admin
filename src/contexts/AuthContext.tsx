"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/services/api";
import { useRouter } from "next/navigation";

interface Admin {
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await authAPI.verifyToken(tokenToVerify);
      if (response.success && response.admin) {
        setAdmin({ email: response.admin.email });
        setToken(tokenToVerify);
      } else {
        localStorage.removeItem("admin_token");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("admin_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.token && response.admin) {
        setToken(response.token);
        setAdmin(response.admin);
        localStorage.setItem("admin_token", response.token);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  const isAuthenticated = !!admin && !!token;

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
