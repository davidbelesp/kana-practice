import { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import "./ThemeSwitcher.css";

type Theme = "default" | "blue" | "green" | "orange";

export const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();
  const currentTheme = settings.theme;

  const themes: { id: Theme; color: string }[] = [
    { id: "default", color: "linear-gradient(135deg, #c85bff, #ff4fa6)" },
    { id: "blue", color: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
    { id: "green", color: "linear-gradient(135deg, #10b981, #84cc16)" },
    { id: "orange", color: "linear-gradient(135deg, #f97316, #eab308)" },
  ];

  return (
    <div className="theme-switcher">
      <div className={`theme-menu ${isOpen ? "open" : ""}`}>
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-option ${currentTheme === t.id ? "active" : ""}`}
            style={{ background: t.color }}
            onClick={() => {
              updateSetting("theme", t.id);
              setIsOpen(false);
            }}
            title={`Select ${t.id} theme`}
            aria-label={`Select ${t.id} theme`}
          />
        ))}
      </div>
      <button
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        🎨
      </button>
    </div>
  );
};
