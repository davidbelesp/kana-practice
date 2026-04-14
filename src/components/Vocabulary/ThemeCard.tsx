import React from "react";
import { useTranslation } from "react-i18next";

interface ThemeCardProps {
  theme: string;
  icon: string;
  count: number;
  onClick: () => void;
  isComingSoon?: boolean;
}

export const ThemeCard: React.FC<ThemeCardProps> = React.memo(({ 
  theme, 
  icon, 
  count, 
  onClick,
  isComingSoon 
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className={`theme-card ${isComingSoon ? 'coming-soon' : ''}`}
      onClick={!isComingSoon ? onClick : undefined}
    >
      <div className="theme-icon">{icon}</div>
      <h2 className="theme-title">
        {isComingSoon ? t("vocabulary.moreComingSoon") : (t(`vocabulary.categories.${theme}`) || theme)}
      </h2>
      <span className="theme-count">
        {isComingSoon ? "..." : t("vocabulary.itemCount", { count })}
      </span>
    </div>
  );
});

ThemeCard.displayName = "ThemeCard";
