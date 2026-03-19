import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../contexts/SettingsContext";
import "./ThemeSwitcher.css";

type Theme = "default" | "blue" | "green" | "orange";

export const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();
  const currentTheme = settings.theme;

  const themes: { id: Theme; labelKey: string; color: string }[] = [
    { id: "default", labelKey: "purple", color: "linear-gradient(135deg, #c85bff, #ff4fa6)" },
    { id: "blue", labelKey: "blue", color: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
    { id: "green", labelKey: "green", color: "linear-gradient(135deg, #10b981, #84cc16)" },
    { id: "orange", labelKey: "orange", color: "linear-gradient(135deg, #f97316, #eab308)" },
  ];

  return (
    <div className="theme-switcher">
      <div className={`theme-menu ${isOpen ? "open" : ""}`}>
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            className={`theme-option ${currentTheme === themeOption.id ? "active" : ""}`}
            style={{ background: themeOption.color }}
            onClick={() => {
              updateSetting("theme", themeOption.id);
              setIsOpen(false);
            }}
            title={t(`settings.appearance.${themeOption.labelKey}`)}
            aria-label={t(`settings.appearance.${themeOption.labelKey}`)}
          />
        ))}
      </div>
      <button
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={t("settings.appearance.accentColor")}
        aria-label={t("settings.appearance.accentColor")}
      >
        🎨
      </button>
    </div>
  );
};
