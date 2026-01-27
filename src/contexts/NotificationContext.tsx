import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Notification } from "../components/Notification";

type NotificationType = "success" | "error" | "info";

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("info");

  const showNotification = useCallback(
    (msg: string, notificationType: NotificationType = "info") => {
      setMessage(msg);
      setType(notificationType);
      setIsVisible(true);

      // Auto hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        message={message}
        type={type}
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
