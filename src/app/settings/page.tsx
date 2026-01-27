"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import type { SystemSettings } from "@/types";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "platform" | "revenue" | "notifications" | "security"
  >("platform");

  const [settings, setSettings] = useState<SystemSettings>(() => ({
    platformName: "ODOK WiFi Platform",
    supportEmail: "support@odok.com",
    revenueShare: 15,
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
  }));

  const tabs = [
    {
      id: "platform" as const,
      name: "Platform",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
    {
      id: "revenue" as const,
      name: "Revenue",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "notifications" as const,
      name: "Notifications",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      id: "security" as const,
      name: "Security",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  ];

  const handleSave = () => {
    // Simulate save
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Settings"
          subtitle="Platform configuration and system preferences"
        />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "platform" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Platform Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={settings.platformName}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              platformName: e.target.value,
                            })
                          }
                          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              supportEmail: e.target.value,
                            })
                          }
                          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      System Options
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Maintenance Mode
                          </p>
                          <p className="text-xs text-gray-500">
                            Temporarily disable platform access
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                maintenanceMode: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Automatic Backups
                          </p>
                          <p className="text-xs text-gray-500">
                            Daily system backups at 2:00 AM
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoBackup}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                autoBackup: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "revenue" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Revenue Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platform Revenue Share (%)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={settings.revenueShare}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                revenueShare: Number(e.target.value),
                              })
                            }
                            className="flex-1 max-w-md"
                          />
                          <span className="text-2xl font-bold text-blue-600 min-w-15">
                            {settings.revenueShare}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Platform earns {settings.revenueShare}% from each
                          transaction, clients receive{" "}
                          {100 - settings.revenueShare}%
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          Revenue Split Example
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">
                              Transaction Amount:
                            </span>
                            <span className="font-medium text-blue-900">
                              UGX 10,000
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">
                              Platform Share ({settings.revenueShare}%):
                            </span>
                            <span className="font-medium text-blue-900">
                              UGX{" "}
                              {((10000 * settings.revenueShare) / 100).toFixed(
                                0,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">
                              Client Share ({100 - settings.revenueShare}%):
                            </span>
                            <span className="font-medium text-blue-900">
                              UGX{" "}
                              {(
                                (10000 * (100 - settings.revenueShare)) /
                                100
                              ).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Email Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive system alerts via email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                emailNotifications: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            SMS Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive critical alerts via SMS
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.smsNotifications}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                smsNotifications: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Alert Types
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: "New Client Registration", enabled: true },
                        { name: "System Errors", enabled: true },
                        { name: "Revenue Milestones", enabled: true },
                        { name: "Location Offline", enabled: false },
                        { name: "Daily Reports", enabled: false },
                      ].map((alert, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm text-gray-700">
                            {alert.name}
                          </span>
                          <input
                            type="checkbox"
                            defaultChecked={alert.enabled}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Security Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Change Password
                        </label>
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">
                          Add an extra layer of security to your account by
                          enabling two-factor authentication.
                        </p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Current Session
                            </p>
                            <p className="text-xs text-gray-500">
                              Windows • Chrome • Kampala, Uganda
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
