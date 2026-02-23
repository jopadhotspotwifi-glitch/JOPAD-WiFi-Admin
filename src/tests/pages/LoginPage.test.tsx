import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/page";

// Mock the entire AuthContext module so we control useAuth's return value
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

// ─── Default mock setup ───────────────────────────────────────────────────────
const mockLogin = vi.fn();
const mockPush = vi.fn();

function setupMocks({
  isAuthenticated = false,
  isLoading = false,
}: {
  isAuthenticated?: boolean;
  isLoading?: boolean;
} = {}) {
  vi.mocked(useAuth).mockReturnValue({
    isLoading,
    isAuthenticated,
    admin: isAuthenticated ? { email: "admin@test.com" } : null,
    token: isAuthenticated ? "tok" : null,
    login: mockLogin,
    logout: vi.fn(),
  });

  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as ReturnType<typeof useRouter>);
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockPush.mockReset();
  });

  it("renders the login form with email and password fields", () => {
    setupMocks();
    render(<LoginPage />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders the JOPAD Wi-Fi Admin heading", () => {
    setupMocks();
    render(<LoginPage />);
    expect(screen.getByText(/JOPAD Wi-Fi Admin/i)).toBeInTheDocument();
  });

  it("shows a loading spinner while auth state is being resolved", () => {
    setupMocks({ isLoading: true });
    render(<LoginPage />);
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it("redirects to /dashboard when already authenticated", () => {
    setupMocks({ isAuthenticated: true });
    render(<LoginPage />);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("updates email and password inputs as user types", async () => {
    setupMocks();
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(emailInput, "admin@test.com");
    await userEvent.type(passwordInput, "secret");

    expect(emailInput).toHaveValue("admin@test.com");
    expect(passwordInput).toHaveValue("secret");
  });

  it("calls login() with entered email and password on submit", async () => {
    mockLogin.mockResolvedValue({ success: true, message: "OK" });
    setupMocks();
    render(<LoginPage />);

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "admin@test.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "correct");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@test.com", "correct");
    });
  });

  it("redirects to /dashboard after successful login", async () => {
    mockLogin.mockResolvedValue({ success: true, message: "Welcome" });
    setupMocks();
    render(<LoginPage />);

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "admin@test.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "correct");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error message on failed login", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });
    setupMocks();
    render(<LoginPage />);

    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "admin@test.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error on unexpected exception", async () => {
    mockLogin.mockRejectedValue(new Error("Unexpected failure"));
    setupMocks();
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email address/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  it("disables submit button and shows loading text while submitting", async () => {
    // Make login take a moment
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, message: "OK" }), 200),
        ),
    );
    setupMocks();
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email address/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/password/i), "pass");

    const btn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(btn);

    // During submission the button text should change
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
