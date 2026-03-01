"use client";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  type = "info",
  onClose,
}: AlertModalProps) {
  if (!isOpen) return null;

  const iconColors = {
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
  };

  const buttonColors = {
    success: "bg-green-600 hover:bg-green-700",
    error: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  const icons = {
    success: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    ),
    error: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    ),
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex flex-col items-center text-center">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconColors[type]}`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {icons[type]}
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${buttonColors[type]}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
