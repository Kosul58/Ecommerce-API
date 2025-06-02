import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: "bg-green-600 border-green-700 text-white",
    error: "bg-red-600 border-red-700 text-white",
  };

  const Icon = type === "success" ? FaCheckCircle : FaTimesCircle;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded shadow-lg border flex items-center gap-2 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } ${typeStyles[type]}`}
    >
      <Icon className="text-xl" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Notification;
