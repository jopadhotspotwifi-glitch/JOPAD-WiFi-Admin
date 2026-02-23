import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { clientsAPI } from "@/services/clients";

const TOKEN = "test-token";

describe("clientsAPI", () => {
  describe("getAll", () => {
    it("returns the clients list", async () => {
      const res = await clientsAPI.getAll(TOKEN);
      expect(res.success).toBe(true);
      expect(res.clients).toHaveLength(1);
      expect(res.clients[0].businessName).toBe("Biz Alpha");
    });

    it("appends status filter to query string", async () => {
      let capturedUrl = "";
      server.use(
        http.get("http://localhost:3000/api/admin/clients", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, clients: [], count: 0 });
        }),
      );
      await clientsAPI.getAll(TOKEN, { status: "active" });
      expect(capturedUrl).toContain("status=active");
    });

    it("does NOT append status when status is 'all'", async () => {
      let capturedUrl = "";
      server.use(
        http.get("http://localhost:3000/api/admin/clients", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, clients: [], count: 0 });
        }),
      );
      await clientsAPI.getAll(TOKEN, { status: "all" });
      expect(capturedUrl).not.toContain("status=");
    });

    it("appends search filter to query string", async () => {
      let capturedUrl = "";
      server.use(
        http.get("http://localhost:3000/api/admin/clients", ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, clients: [], count: 0 });
        }),
      );
      await clientsAPI.getAll(TOKEN, { search: "alpha" });
      expect(capturedUrl).toContain("search=alpha");
    });
  });

  describe("getById", () => {
    it("returns a single client by ID", async () => {
      const res = await clientsAPI.getById(TOKEN, "c1");
      expect(res.success).toBe(true);
      expect(res.client?._id).toBe("c1");
    });
  });

  describe("create", () => {
    it("creates a client and returns it with active status", async () => {
      const payload = {
        businessName: "New Biz",
        ownerName: "Bob",
        email: "bob@newbiz.com",
        phone: "0700000099",
      };
      const res = await clientsAPI.create(TOKEN, payload);
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/created/i);
      expect(res.client?.email).toBe("bob@newbiz.com");
      expect(res.client?.status).toBe("active");
    });
  });

  describe("update", () => {
    it("sends PUT and returns success response", async () => {
      const res = await clientsAPI.update(TOKEN, "c1", {
        businessName: "Updated Biz",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("delete", () => {
    it("sends DELETE and returns success", async () => {
      const res = await clientsAPI.delete(TOKEN, "c1");
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/deleted/i);
    });
  });

  describe("update status via update()", () => {
    it("updates client status using update() with status field", async () => {
      const res = await clientsAPI.update(TOKEN, "c1", { status: "suspended" });
      expect(res.success).toBe(true);
    });
  });
});
