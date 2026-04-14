import React from "react";
import { useTranslation } from "react-i18next";
import type { VocabularyItem } from "../../types/Vocabulary";

interface WordCardProps {
  item?: VocabularyItem;
  isComingSoon?: boolean;
  langFlags: Record<string, string>;
  tagColors: Record<string, string>;
  onTagClick: (tag: string) => void;
  onCopy: (text: string) => void;
  copyTitle: string;
}

export const WordCard: React.FC<WordCardProps> = React.memo(({
  item,
  isComingSoon,
  langFlags,
  tagColors,
  onTagClick,
  onCopy,
  copyTitle
}) => {
  const { t, i18n } = useTranslation();

  if (isComingSoon) {
    return (
      <div className="word-card coming-soon">
        <div className="word-card-top">
          <div className="word-japanese-section">
            <span className="word-japanese">{t("vocabulary.moreComingSoon")}</span>
          </div>
        </div>
        <div className="word-card-image">
          <span>✨</span>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const currentLang = i18n.language.split("-")[0];
  const translation = item.translation.find(t => t.lang === currentLang) || 
                     item.translation.find(t => t.lang === "en") || 
                     item.translation[0];

  return (
    <div className="word-card">
      <div className="word-card-top">
        <div className="word-japanese-section">
          <div className="word-card-category-wrapper">
            <span className="word-type-badge">{item.type}</span>
          </div>
          <span 
            className="word-japanese clickable" 
            onClick={() => onCopy(item.japanese)}
            title={copyTitle}
          >
            {item.japanese}
          </span>
          <span className="word-hiragana">{item.hiragana}</span>
          <span className="word-romaji">{item.romaji}</span>
        </div>
      </div>
      
      {item.image && (
        <div className="word-card-image">
          {item.image.startsWith("http") ? (
            <img src={item.image} alt={item.japanese} />
          ) : (
            <span>{item.image}</span>
          )}
        </div>
      )}
      
      <div className="word-card-footer">
        <div className="word-translations">
          {translation && (
            <div className="translation-item">
              <span className="lang-flag">{langFlags[translation.lang] || "🌐"}</span>
              <span className="translation-text">{translation.translation}</span>
            </div>
          )}
        </div>

        <div className="word-tags">
          {item.tags.map(tag => (
            <button 
              key={tag} 
              className="tag-badge clickable"
              onClick={() => onTagClick(tag)}
              style={{ 
                backgroundColor: `${tagColors[tag] || tagColors.default}33`,
                color: tagColors[tag] || tagColors.default,
                borderColor: `${tagColors[tag] || tagColors.default}66`
              } as React.CSSProperties}
            >
              {t(`vocabulary.categories.${tag}`) || tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

WordCard.displayName = "WordCard";
