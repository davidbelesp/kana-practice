import { useEffect, useState } from "react";
import "./Notification.css";
import { Check, X, Info } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export const Notification = ({
  message,
  type,
  isVisible,
  onClose,
}: NotificationProps) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300); // Wait for animation
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const icons = {
    success: <Check size={20} />,
    error: <X size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`notification-toast ${type} ${isVisible ? "visible" : ""}`}>
      <div className="notification-icon">{icons[type]}</div>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};
