import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { vocabularyData } from "../data/vocabulary";
import { useNotification } from "../contexts/NotificationContext";
import { useDebounce } from "../hooks/useDebounce";

// Components
import { ThemeCard } from "../components/Vocabulary/ThemeCard";
import { WordCard } from "../components/Vocabulary/WordCard";
import { TagSelector } from "../components/Vocabulary/TagSelector";

import "./Vocabulary.css";

const themeIcons: Record<string, string> = {
  fruit: "🍎",
  animal: "🐶",
  color: "🎨",
  food: "🍱",
  nature: "🌲",
  travel: "✈️",
  human: "👤",
  time: "⏰"
};

const langFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  it: "🇮🇹",
  de: "🇩🇪",
  ja: "🇯🇵"
};

const tagColors: Record<string, string> = {
  fruit: "#10b981",
  food: "#f59e0b",
  animal: "#ef4444",
  color: "#3b82f6",
  nature: "#22c55e",
  travel: "#8b5cf6",
  human: "#f43f5e",
  time: "#64748b",
  default: "#94a3b8"
};

export const Vocabulary: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Pre-calculate themes once
  const themes = useMemo(() => {
    const themeSet = new Set<string>();
    vocabularyData.forEach(item => {
      item.tags.forEach(tag => themeSet.add(tag));
    });
    return Array.from(themeSet);
  }, []);

  // Optimized filtering logic
  const filteredVocabulary = useMemo(() => {
    let base = vocabularyData;
    
    // Theme filter is high priority
    if (selectedTheme) {
      base = base.filter(item => item.tags.includes(selectedTheme));
    }
    
    // Use debounced search for performance
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (query) {
      base = base.filter(item => {
        return (
          item.japanese.toLowerCase().includes(query) ||
          item.hiragana.toLowerCase().includes(query) ||
          item.romaji.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query)) ||
          item.translation.some(trans => trans.translation.toLowerCase().includes(query))
        );
      });
    }

    return base;
  }, [selectedTheme, debouncedSearchQuery]);

  // Callbacks
  const handleThemeClick = useCallback((theme: string) => {
    setSelectedTheme(theme);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToThemes = useCallback(() => {
    setSelectedTheme(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setSearchQuery(tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(t("canvas.copySuccess"), "success");
    }).catch(() => {
      showNotification(t("canvas.copyError"), "error");
    });
  }, [t, showNotification]);

  return (
    <div className="container vocabulary-container">
      <header className="home-header">
        <h1 className="title">{t("vocabulary.title")}</h1>
        <p className="subtitle">
          {selectedTheme 
            ? t(`vocabulary.categories.${selectedTheme}`)
            : t("vocabulary.subtitle")
          }
        </p>

        <div className="vocabulary-controls">
          <div className="search-bar-container glass-panel">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input"
              placeholder={t("vocabulary.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
          
          <div className="secondary-actions">
            {selectedTheme ? (
              <button className="btn-secondary link-btn" onClick={handleBackToThemes}>
                ← {t("vocabulary.back")}
              </button>
            ) : (
              <Link to="/" className="btn-secondary link-btn">
                ← {t("common.home")}
              </Link>
            )}
          </div>
        </div>

        {!selectedTheme && themes.length > 0 && (
          <TagSelector 
            tags={themes}
            activeTag={searchQuery}
            onTagClick={handleTagClick}
            tagColors={tagColors}
          />
        )}
      </header>

      {searchQuery && !selectedTheme && (
        <div className="search-results-info">
          <span>{t("vocabulary.resultsFor", { query: searchQuery })}</span>
          <button className="btn-text" onClick={() => setSearchQuery("")}>{t("common.clear")}</button>
        </div>
      )}

      {(!selectedTheme && !searchQuery) ? (
        <div className="vocabulary-grid">
          {themes.map(theme => (
            <ThemeCard 
              key={theme}
              theme={theme}
              icon={themeIcons[theme] || "📚"}
              count={vocabularyData.filter(i => i.tags.includes(theme)).length}
              onClick={() => handleThemeClick(theme)}
            />
          ))}
          <ThemeCard 
            theme="coming-soon"
            icon="⏳"
            count={0}
            onClick={() => {}}
            isComingSoon
          />
        </div>
      ) : (
        <div className="word-grid">
          {filteredVocabulary.map((item, idx) => (
            <WordCard 
              key={`${item.romaji}-${idx}`}
              item={item}
              langFlags={langFlags}
              tagColors={tagColors}
              onTagClick={handleTagClick}
              onCopy={handleCopy}
              copyTitle={t("canvas.copyTitle")}
            />
          ))}
          <WordCard 
            isComingSoon
            langFlags={langFlags}
            tagColors={tagColors}
            onTagClick={handleTagClick}
            onCopy={handleCopy}
            copyTitle={t("canvas.copyTitle")}
          />
          {filteredVocabulary.length === 0 && !searchQuery && (
            <div className="no-results glass-panel">
              <div className="no-results-icon">∅</div>
              <p>{t("vocabulary.noResults")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
