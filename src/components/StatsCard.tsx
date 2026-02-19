import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
  showIndicator?: boolean;
  className?: string;
}

export default function StatsCard({
  label,
  value,
  variant = "default",
  showIndicator = false,
  className = "",
}: StatsCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-gray-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div
      className={`bg-gray-200 rounded-2xl border border-gray-300 p-4 ${className}`}
    >
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-2xl font-bold ${getValueColor()}`}>{value}</p>
        {showIndicator && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
