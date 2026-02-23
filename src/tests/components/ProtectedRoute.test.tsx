import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

// Mock useAuth so we can control its return value per test
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

const Placeholder = () => <div>Protected content</div>;

describe("ProtectedRoute", () => {
  it("shows loading spinner while auth is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      admin: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <Placeholder />
      </ProtectedRoute>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders nothing (null) when not authenticated and not loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      admin: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(
      <ProtectedRoute>
        <Placeholder />
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("redirects to '/' when unauthenticated", () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);

    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      admin: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <Placeholder />
      </ProtectedRoute>,
    );

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("renders children when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      admin: { email: "admin@test.com" },
      token: "tok",
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <Placeholder />
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("does NOT redirect when authenticated", () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);

    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      admin: { email: "admin@test.com" },
      token: "tok",
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <Placeholder />
      </ProtectedRoute>,
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
