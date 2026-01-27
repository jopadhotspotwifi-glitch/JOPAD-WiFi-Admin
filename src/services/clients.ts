const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface Client {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  totalLocations: number;
  totalRevenue: number;
  activeSessions: number;
  createdAt: string;
  updatedAt: string;
}

interface ClientsResponse {
  success: boolean;
  clients: Client[];
  count: number;
}

interface ClientResponse {
  success: boolean;
  client?: Client;
  message: string;
}

export const clientsAPI = {
  /**
   * Get all clients with optional filters
   */
  getAll: async (
    token: string,
    filters?: { status?: string; search?: string },
  ): Promise<ClientsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const url = `${API_BASE_URL}/admin/clients${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },

  /**
   * Get a single client by ID
   */
  getById: async (token: string, id: string): Promise<ClientResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },

  /**
   * Create a new client
   */
  create: async (
    token: string,
    data: {
      businessName: string;
      ownerName: string;
      email: string;
      phone: string;
    },
  ): Promise<ClientResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  },

  /**
   * Update a client
   */
  update: async (
    token: string,
    id: string,
    data: Partial<{
      businessName: string;
      ownerName: string;
      email: string;
      phone: string;
      status: "active" | "inactive" | "suspended";
    }>,
  ): Promise<ClientResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/clients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  },

  /**
   * Delete a client
   */
  delete: async (token: string, id: string): Promise<ClientResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/clients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },
};
