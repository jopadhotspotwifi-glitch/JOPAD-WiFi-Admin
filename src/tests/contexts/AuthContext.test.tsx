import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("@/services/api", () => ({
  authAPI: {
    login: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

// ─── Helper component ─────────────────────────────────────────────────────────
function AuthConsumer() {
  const { admin, token, isLoading, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</div>
      <div data-testid="email">{admin?.email ?? "none"}</div>
      <div data-testid="token">{token ?? "none"}</div>
      <button
        onClick={() => login("admin@test.com", "correct")}
        data-testid="login-btn"
      >
        Login
      </button>
      <button
        onClick={() => login("admin@test.com", "wrong")}
        data-testid="login-fail-btn"
      >
        Login Fail
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    // Suppress expected console.error from React
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
    vi.restoreAllMocks();
  });

  it("becomes ready with no auth when no token is stored", async () => {
    // verifyToken should NOT be called when there's nothing in localStorage
    vi.mocked(authAPI.verifyToken).mockResolvedValue({
      success: false,
      message: "No token",
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
    });
    expect(screen.getByTestId("authenticated").textContent).toBe("no");
    expect(screen.getByTestId("email").textContent).toBe("none");
    expect(authAPI.verifyToken).not.toHaveBeenCalled();
  });

  it("verifies stored token on mount and restores authenticated state on success", async () => {
    localStorage.setItem("admin_token", "stored-token");
    vi.mocked(authAPI.verifyToken).mockResolvedValue({
      success: true,
      message: "OK",
      admin: { email: "admin@test.com", adminId: "abc" },
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("yes");
    });
    expect(screen.getByTestId("email").textContent).toBe("admin@test.com");
    expect(screen.getByTestId("token").textContent).toBe("stored-token");
  });

  it("clears localStorage when stored token verification fails", async () => {
    localStorage.setItem("admin_token", "expired-token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(authAPI.verifyToken).mockResolvedValue({
      success: false,
      message: "Expired",
    });

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
    });
    expect(screen.getByTestId("authenticated").textContent).toBe("no");
    expect(localStorage.getItem("admin_token")).toBeNull();
  });

  it("clears localStorage when token verification throws", async () => {
    localStorage.setItem("admin_token", "bad-token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(authAPI.verifyToken).mockRejectedValue(
      new Error("Network error"),
    );

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("ready");
    });
    expect(localStorage.getItem("admin_token")).toBeNull();
  });

  describe("login()", () => {
    it("sets admin and token on successful login", async () => {
      vi.mocked(authAPI.verifyToken).mockResolvedValue({
        success: false,
        message: "No token",
      });
      vi.mocked(authAPI.login).mockResolvedValue({
        success: true,
        message: "Welcome",
        token: "new-token-abc",
        admin: { email: "admin@test.com", createdAt: "2024-01-01" },
      });

      renderAuth();
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        await userEvent.click(screen.getByTestId("login-btn"));
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("yes");
      expect(screen.getByTestId("email").textContent).toBe("admin@test.com");
      expect(screen.getByTestId("token").textContent).toBe("new-token-abc");
      expect(localStorage.getItem("admin_token")).toBe("new-token-abc");
    });

    it("returns success:false and does not set state on failed login", async () => {
      vi.mocked(authAPI.verifyToken).mockResolvedValue({
        success: false,
        message: "No token",
      });
      vi.mocked(authAPI.login).mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });

      renderAuth();
      await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("ready"),
      );

      await act(async () => {
        await userEvent.click(screen.getByTestId("login-fail-btn"));
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("no");
      expect(localStorage.getItem("admin_token")).toBeNull();
    });

    it("returns network error message when authAPI.login throws", async () => {
      vi.mocked(authAPI.verifyToken).mockResolvedValue({
        success: false,
        message: "No token",
      });
      vi.mocked(authAPI.login).mockRejectedValue(new Error("Network down"));
      vi.spyOn(console, "error").mockImplementation(() => {});

      // Custom consumer to capture login return value
      let loginResult: { success: boolean; message: string } | null = null;
      function Capture() {
        const { login } = useAuth();
        return (
          <button
            onClick={async () => {
              loginResult = await login("x@test.com", "pass");
            }}
          >
            Trigger
          </button>
        );
      }

      render(
        <AuthProvider>
          <Capture />
        </AuthProvider>,
      );

      await act(async () => {
        await userEvent.click(screen.getByText("Trigger"));
      });

      expect(loginResult?.success).toBe(false);
      expect(loginResult?.message).toMatch(/network|error/i);
    });
  });

  describe("logout()", () => {
    it("clears admin, token, localStorage and redirects to '/'", async () => {
      localStorage.setItem("admin_token", "live-token");
      const mockPush = vi.fn();
      vi.mocked(useRouter).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
      } as ReturnType<typeof useRouter>);
      vi.mocked(authAPI.verifyToken).mockResolvedValue({
        success: true,
        message: "OK",
        admin: { email: "admin@test.com", adminId: "abc" },
      });

      renderAuth();
      await waitFor(() =>
        expect(screen.getByTestId("authenticated").textContent).toBe("yes"),
      );

      await act(async () => {
        await userEvent.click(screen.getByTestId("logout-btn"));
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("no");
      expect(screen.getByTestId("email").textContent).toBe("none");
      expect(localStorage.getItem("admin_token")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
