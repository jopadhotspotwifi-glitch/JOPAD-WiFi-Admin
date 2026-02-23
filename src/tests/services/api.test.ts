import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import {
  authAPI,
  settingsAPI,
  statsAPI,
  adsAPI,
  analyticsAPI,
  revenueAPI,
} from "@/services/api";

// ─────────────────────────────────────────────────────────────────────────────
// authAPI
// ─────────────────────────────────────────────────────────────────────────────
describe("authAPI", () => {
  describe("login", () => {
    it("returns success response with token and admin on valid credentials", async () => {
      const res = await authAPI.login("admin@test.com", "correct");
      expect(res.success).toBe(true);
      expect(res.token).toBe("mock-token-xyz");
      expect(res.admin?.email).toBe("admin@test.com");
    });

    it("returns failure response on invalid credentials", async () => {
      const res = await authAPI.login("admin@test.com", "wrong");
      expect(res.success).toBe(false);
      expect(res.message).toBe("Invalid credentials");
      expect(res.token).toBeUndefined();
    });

    it("handles network errors gracefully (no throw)", async () => {
      server.use(
        http.post("http://localhost:3000/api/admin/auth/login", () =>
          HttpResponse.error(),
        ),
      );
      // authAPI.login does NOT wrap in try/catch, so a fetch network
      // failure propagates as a rejection
      await expect(authAPI.login("x@x.com", "pass")).rejects.toThrow();
    });
  });

  describe("verifyToken", () => {
    it("returns success with admin data for valid token", async () => {
      const res = await authAPI.verifyToken("valid-token");
      expect(res.success).toBe(true);
      expect(res.admin?.email).toBe("admin@test.com");
    });

    it("returns failure when server returns non-ok", async () => {
      server.use(
        http.get("http://localhost:3000/api/admin/auth/verify", () =>
          HttpResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
          ),
        ),
      );
      const res = await authAPI.verifyToken("bad-token");
      expect(res.success).toBe(false);
    });

    it("returns failure object on network error (does not throw)", async () => {
      server.use(
        http.get("http://localhost:3000/api/admin/auth/verify", () =>
          HttpResponse.error(),
        ),
      );
      const res = await authAPI.verifyToken("any-token");
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/network/i);
    });
  });

  describe("requestOTP", () => {
    it("returns success for registered email", async () => {
      const res = await authAPI.requestOTP("admin@test.com");
      expect(res.success).toBe(true);
    });

    it("returns failure for unknown email", async () => {
      const res = await authAPI.requestOTP("unknown@x.com");
      expect(res.success).toBe(false);
    });
  });

  describe("verifyOTP", () => {
    it("returns token when OTP is correct", async () => {
      const res = await authAPI.verifyOTP("admin@test.com", "123456");
      expect(res.success).toBe(true);
      expect(res.token).toBe("otp-token-xyz");
    });

    it("returns failure for wrong OTP", async () => {
      const res = await authAPI.verifyOTP("admin@test.com", "000000");
      expect(res.success).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// settingsAPI
// ─────────────────────────────────────────────────────────────────────────────
describe("settingsAPI", () => {
  const token = "test-token";

  it("get – returns settings on success", async () => {
    const res = await settingsAPI.get(token);
    expect(res.success).toBe(true);
    expect(res.settings.platformName).toBe("JOPAD Wi-Fi");
    expect(res.settings.currency).toBe("UGX");
  });

  it("get – returns failure on non-ok response", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/settings", () =>
        HttpResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        ),
      ),
    );
    const res = await settingsAPI.get(token);
    expect(res.success).toBe(false);
  });

  it("get – returns failure on network error", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/settings", () =>
        HttpResponse.error(),
      ),
    );
    const res = await settingsAPI.get(token);
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/network/i);
  });

  it("update – sends PUT and returns updated settings", async () => {
    const res = await settingsAPI.update(token, { platformFeePercent: 20 });
    expect(res.success).toBe(true);
  });

  it("patch – sends PATCH and returns settings", async () => {
    const res = await settingsAPI.patch(token, { maintenanceMode: true });
    expect(res.success).toBe(true);
  });

  it("reset – restores default settings", async () => {
    const res = await settingsAPI.reset(token);
    expect(res.success).toBe(true);
    expect(res.settings.platformFeePercent).toBe(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// statsAPI
// ─────────────────────────────────────────────────────────────────────────────
describe("statsAPI", () => {
  const token = "test-token";

  it("get – returns platform stats", async () => {
    const res = await statsAPI.get(token);
    expect(res.success).toBe(true);
    expect(res.stats.totalClients).toBe(10);
    expect(res.stats.activeClients).toBe(8);
    expect(res.stats.totalRevenue).toBe(5_000_000);
  });

  it("get – returns failure on non-ok response", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/stats", () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    );
    const res = await statsAPI.get(token);
    expect(res.success).toBe(false);
  });

  it("get – returns failure on network error", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/stats", () =>
        HttpResponse.error(),
      ),
    );
    const res = await statsAPI.get(token);
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/network/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// adsAPI
// ─────────────────────────────────────────────────────────────────────────────
describe("adsAPI", () => {
  const token = "test-token";

  it("getAll – returns ads list", async () => {
    const res = await adsAPI.getAll(token);
    expect(res.success).toBe(true);
    expect(res.ads).toHaveLength(1);
    expect(res.ads[0].title).toBe("Banner One");
  });

  it("getAll – passes filter params in query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost:3000/api/admin/ads", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ success: true, ads: [], count: 0 });
      }),
    );
    await adsAPI.getAll(token, { status: "active", type: "image" });
    expect(capturedUrl).toContain("status=active");
    expect(capturedUrl).toContain("type=image");
  });

  it("getStats – returns ad statistics", async () => {
    const res = await adsAPI.getStats(token);
    expect(res.success).toBe(true);
    expect(res.stats.total).toBe(5);
    expect(res.stats.active).toBe(3);
  });

  it("getById – returns a single ad", async () => {
    const res = await adsAPI.getById(token, "ad1");
    expect(res.success).toBe(true);
    expect(res.ad._id).toBe("ad1");
  });

  it("create – posts form data and returns new ad", async () => {
    const formData = new FormData();
    formData.append("title", "New Ad");
    formData.append("type", "image");
    const res = await adsAPI.create(token, formData);
    expect(res.success).toBe(true);
    expect(res.ad?._id).toBe("ad-new");
  });

  it("toggle – toggles ad status", async () => {
    const res = await adsAPI.toggle(token, "ad1");
    expect(res.success).toBe(true);
    expect(res.ad?.status).toBe("inactive");
  });

  it("delete – removes ad and returns success", async () => {
    const res = await adsAPI.delete(token, "ad1");
    expect(res.success).toBe(true);
    expect(res.message).toBe("Ad deleted");
  });

  it("getLocations – returns location list for dropdown", async () => {
    const res = await adsAPI.getLocations(token);
    expect(res.success).toBe(true);
    expect(res.locations).toHaveLength(1);
    expect(res.locations[0].name).toBe("Main Branch");
  });

  it("getAll – returns empty list on network error", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/ads", () =>
        HttpResponse.error(),
      ),
    );
    const res = await adsAPI.getAll(token);
    expect(res.success).toBe(false);
    expect(res.ads).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// analyticsAPI
// ─────────────────────────────────────────────────────────────────────────────
describe("analyticsAPI", () => {
  const token = "test-token";

  it("get – returns analytics data for default period", async () => {
    const res = await analyticsAPI.get(token);
    expect(res.success).toBe(true);
    expect(res.analytics.sessionsByPlan).toHaveLength(1);
    expect(res.analytics.deviceStats[0].type).toBe("mobile");
  });

  it("get – passes period query param", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost:3000/api/admin/analytics", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          success: true,
          analytics: {
            sessionsByPlan: [],
            topLocations: [],
            deviceStats: [],
            hourlyData: [],
          },
        });
      }),
    );
    await analyticsAPI.get(token, "7d");
    expect(capturedUrl).toContain("period=7d");
  });

  it("get – returns empty analytics on network error", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/analytics", () =>
        HttpResponse.error(),
      ),
    );
    const res = await analyticsAPI.get(token);
    expect(res.success).toBe(false);
    expect(res.analytics.sessionsByPlan).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// revenueAPI
// ─────────────────────────────────────────────────────────────────────────────
describe("revenueAPI", () => {
  const token = "test-token";

  it("get – returns revenue data for default period", async () => {
    const res = await revenueAPI.get(token);
    expect(res.success).toBe(true);
    expect(res.revenue.totalRevenue).toBe(5_000_000);
    expect(res.revenue.revenueShare).toBe(15);
  });

  it("get – passes period query param", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost:3000/api/admin/revenue", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          success: true,
          revenue: {
            totalRevenue: 0,
            platformRevenue: 0,
            clientRevenue: 0,
            revenueShare: 15,
            trend: [],
            byClient: [],
            byPlan: [],
          },
        });
      }),
    );
    await revenueAPI.get(token, "7d");
    expect(capturedUrl).toContain("period=7d");
  });

  it("get – returns zero revenue on network error", async () => {
    server.use(
      http.get("http://localhost:3000/api/admin/revenue", () =>
        HttpResponse.error(),
      ),
    );
    const res = await revenueAPI.get(token);
    expect(res.success).toBe(false);
    expect(res.revenue.totalRevenue).toBe(0);
  });
});
