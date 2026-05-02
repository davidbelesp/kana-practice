import { useCallback, useEffect, useState } from "react";
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
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isVisible && !isAnimatingOut) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (isVisible) {
      setIsAnimatingOut(false);
    }
  }, [isVisible, isAnimatingOut]);

  const shouldRender = isVisible || isAnimatingOut;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!shouldRender) return null;

  const icons = {
    success: <Check size={20} aria-hidden="true" />,
    error: <X size={20} aria-hidden="true" />,
    info: <Info size={20} aria-hidden="true" />,
  };

  return (
    <div
      className={`notification-toast ${type} ${isVisible ? "visible" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-icon">{icons[type]}</div>
      <span className="notification-message">{message}</span>
      <button
        className="notification-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};
