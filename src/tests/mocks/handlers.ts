import { http, HttpResponse } from "msw";

const BASE = "http://localhost:3000/api";

export const handlers = [
  // ────────── Auth ──────────
  http.post(`${BASE}/admin/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
    };
    if (body.email === "admin@test.com" && body.password === "correct") {
      return HttpResponse.json({
        success: true,
        message: "Login successful",
        token: "mock-token-xyz",
        admin: { email: "admin@test.com", createdAt: "2024-01-01T00:00:00Z" },
      });
    }
    return HttpResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.get(`${BASE}/admin/auth/verify`, () =>
    HttpResponse.json({
      success: true,
      admin: { email: "admin@test.com", adminId: "abc123" },
    }),
  ),

  http.post(`${BASE}/admin/auth/request-otp`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (body.email === "admin@test.com") {
      return HttpResponse.json({
        success: true,
        message: "OTP sent to your email",
      });
    }
    return HttpResponse.json(
      { success: false, message: "Email not found" },
      { status: 404 },
    );
  }),

  http.post(`${BASE}/admin/auth/verify-otp`, async ({ request }) => {
    const body = (await request.json()) as { email: string; otp: string };
    if (body.otp === "123456") {
      return HttpResponse.json({
        success: true,
        token: "otp-token-xyz",
        admin: { email: body.email, createdAt: "2024-01-01T00:00:00Z" },
      });
    }
    return HttpResponse.json(
      { success: false, message: "Invalid or expired OTP" },
      { status: 400 },
    );
  }),

  // ────────── Stats ──────────
  http.get(`${BASE}/admin/stats`, () =>
    HttpResponse.json({
      success: true,
      stats: {
        totalClients: 10,
        activeClients: 8,
        totalLocations: 25,
        activeLocations: 20,
        totalRevenue: 5_000_000,
        activeSessions: 50,
        revenueGrowth: 12.5,
      },
    }),
  ),

  // ────────── Settings ──────────
  http.get(`${BASE}/admin/settings`, () =>
    HttpResponse.json({
      success: true,
      settings: {
        platformName: "JOPAD Wi-Fi",
        platformFeePercent: 15,
        currency: "UGX",
        maintenanceMode: false,
      },
    }),
  ),

  http.put(`${BASE}/admin/settings`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, settings: body });
  }),

  http.patch(`${BASE}/admin/settings`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, settings: body });
  }),

  http.post(`${BASE}/admin/settings/reset`, () =>
    HttpResponse.json({
      success: true,
      settings: {
        platformName: "JOPAD Wi-Fi",
        platformFeePercent: 15,
        currency: "UGX",
        maintenanceMode: false,
      },
    }),
  ),

  // ────────── Clients ──────────
  http.get(`${BASE}/admin/clients`, () =>
    HttpResponse.json({
      success: true,
      clients: [
        {
          _id: "c1",
          businessName: "Biz Alpha",
          ownerName: "Alice",
          email: "alice@biz.com",
          phone: "0700000001",
          status: "active",
          totalLocations: 2,
          totalRevenue: 200_000,
          activeSessions: 5,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      count: 1,
    }),
  ),

  http.post(`${BASE}/admin/clients`, async ({ request }) => {
    const body = (await request.json()) as {
      businessName: string;
      ownerName: string;
      email: string;
      phone: string;
    };
    return HttpResponse.json({
      success: true,
      message: "Client created successfully",
      client: {
        _id: "c-new",
        ...body,
        status: "active",
        totalLocations: 0,
        totalRevenue: 0,
        activeSessions: 0,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    });
  }),

  http.get(`${BASE}/admin/clients/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      client: {
        _id: params.id,
        businessName: "Biz Alpha",
        ownerName: "Alice",
        email: "alice@biz.com",
        phone: "0700000001",
        status: "active",
        totalLocations: 2,
        totalRevenue: 200_000,
        activeSessions: 5,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    }),
  ),

  http.put(`${BASE}/admin/clients/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: "Client updated",
      client: { _id: params.id, ...(body as object) },
    });
  }),

  http.delete(`${BASE}/admin/clients/:id`, () =>
    HttpResponse.json({ success: true, message: "Client deleted" }),
  ),

  http.patch(
    `${BASE}/admin/clients/:id/status`,
    async ({ params, request }) => {
      const body = (await request.json()) as { status: string };
      return HttpResponse.json({
        success: true,
        message: `Client ${body.status}`,
        client: { _id: params.id, status: body.status },
      });
    },
  ),

  // ────────── Ads ──────────
  http.get(`${BASE}/admin/ads`, () =>
    HttpResponse.json({
      success: true,
      ads: [
        {
          _id: "ad1",
          title: "Banner One",
          type: "image",
          status: "active",
          mediaUrl: "https://example.com/img.jpg",
          impressions: 120,
          clicks: 15,
        },
      ],
      count: 1,
    }),
  ),

  http.get(`${BASE}/admin/ads/stats/summary`, () =>
    HttpResponse.json({
      success: true,
      stats: {
        total: 5,
        active: 3,
        inactive: 2,
        totalImpressions: 600,
        totalClicks: 60,
      },
    }),
  ),

  http.get(`${BASE}/admin/ads/locations/list`, () =>
    HttpResponse.json({
      success: true,
      locations: [{ _id: "loc1", name: "Main Branch" }],
    }),
  ),

  http.get(`${BASE}/admin/ads/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      ad: {
        _id: params.id,
        title: "Test Ad",
        type: "image",
        status: "active",
        mediaUrl: "https://example.com/img.jpg",
        impressions: 10,
        clicks: 1,
      },
    }),
  ),

  http.post(`${BASE}/admin/ads`, () =>
    HttpResponse.json({
      success: true,
      ad: {
        _id: "ad-new",
        title: "New Ad",
        type: "image",
        status: "active",
        mediaUrl: "https://example.com/new.jpg",
        impressions: 0,
        clicks: 0,
      },
    }),
  ),

  http.put(`${BASE}/admin/ads/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      ad: { _id: params.id, title: "Updated Ad", status: "active" },
    }),
  ),

  http.patch(`${BASE}/admin/ads/:id/toggle`, ({ params }) =>
    HttpResponse.json({
      success: true,
      ad: { _id: params.id, status: "inactive" },
    }),
  ),

  http.delete(`${BASE}/admin/ads/:id`, () =>
    HttpResponse.json({ success: true, message: "Ad deleted" }),
  ),

  // ────────── Analytics ──────────
  http.get(`${BASE}/admin/analytics`, () =>
    HttpResponse.json({
      success: true,
      analytics: {
        sessionsByPlan: [{ plan: "Basic 1hr", count: 30 }],
        topLocations: [{ name: "Head Office", sessions: 80 }],
        deviceStats: [{ type: "mobile", count: 60 }],
        hourlyData: [{ hour: 10, sessions: 15 }],
      },
    }),
  ),

  // ────────── Revenue ──────────
  http.get(`${BASE}/admin/revenue`, () =>
    HttpResponse.json({
      success: true,
      revenue: {
        totalRevenue: 5_000_000,
        platformRevenue: 750_000,
        clientRevenue: 4_250_000,
        revenueShare: 15,
        trend: [],
        byClient: [],
        byPlan: [],
      },
    }),
  ),
];
