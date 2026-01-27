// Admin Portal TypeScript Types

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "support";
  avatar?: string;
}

export interface Client {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: "active" | "suspended" | "inactive";
  totalLocations: number;
  totalRevenue: number;
  activeSessions: number;
  joinedDate: Date;
  subscriptionPlan: "starter" | "professional" | "enterprise";
  lastActive: Date;
}

export interface Location {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  address: string;
  routerType: "MikroTik" | "OpenWRT" | "Ubiquiti";
  status: "online" | "offline" | "error";
  activeSessions: number;
  totalRevenue: number;
  createdAt: Date;
}

export interface PlatformStats {
  totalClients: number;
  activeClients: number;
  totalLocations: number;
  activeSessions: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  revenueGrowth: number;
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  locationId: string;
  locationName: string;
  macAddress: string;
  deviceInfo: string;
  planName: string;
  startTime: Date;
  endTime: Date;
  status: "active" | "expired" | "terminated";
  dataUsed: number;
  revenue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  sessions: number;
  clients: number;
}

export interface SystemAlert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ClientActivity {
  id: string;
  clientId: string;
  clientName: string;
  action: string;
  timestamp: Date;
  details?: string;
}

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  revenueShare: number;
  maintenanceMode: boolean;
  autoBackup: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}
