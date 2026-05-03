import React from "react";
import { useTranslation } from "react-i18next";
import { getCategory } from "../../data/categories";

interface ThemeCardProps {
  theme: string;
  count: number;
  onClick: (theme: string) => void;
  isComingSoon?: boolean;
}

export const ThemeCard: React.FC<ThemeCardProps> = React.memo(({
  theme,
  count,
  onClick,
  isComingSoon
}) => {
  const { t } = useTranslation();

  const handleClick = React.useCallback(() => {
    if (!isComingSoon) {
      onClick(theme);
    }
  }, [isComingSoon, onClick, theme]);

  const icon = isComingSoon ? "⏳" : getCategory(theme).icon;

  return (
    <div
      className={`theme-card ${isComingSoon ? 'coming-soon' : ''}`}
      onClick={handleClick}
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
