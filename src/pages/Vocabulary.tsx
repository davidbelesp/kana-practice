import React, { useState, useMemo, useCallback } from "react";
import { NavBar } from "../components/ui/NavBar";
import { useTranslation } from "react-i18next";
import { vocabularyData } from "../data/vocabulary";
import { useNotification } from "../contexts/NotificationContext";
import { useDebounce } from "../hooks/useDebounce";
import type { VocabularyItem } from "../types/Vocabulary";

// Components
import { ThemeCard } from "../components/Vocabulary/ThemeCard";
import { WordCard } from "../components/Vocabulary/WordCard";
import { TagSelector } from "../components/Vocabulary/TagSelector";
import { SearchBar } from "../components/Vocabulary/SearchBar";

import "./Vocabulary.css";

const langFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  it: "🇮🇹",
  de: "🇩🇪",
  ja: "🇯🇵"
};

export const Vocabulary: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [textQuery, setTextQuery] = useState("");
  const debouncedTextQuery = useDebounce(textQuery, 200);

  const themes = useMemo(() => {
    const themeSet = new Set<string>();
    vocabularyData.forEach(item => {
      item.tags.forEach(tag => themeSet.add(tag));
    });
    return Array.from(themeSet);
  }, []);

  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    themes.forEach(theme => {
      counts[theme] = 0;
    });
    vocabularyData.forEach(item => {
      item.tags.forEach(tag => {
        if (counts[tag] !== undefined) {
          counts[tag]++;
        }
      });
    });
    return counts;
  }, [themes]);

  const filteredVocabulary = useMemo(() => {
    let base = vocabularyData;

    if (selectedTags.length > 0) {
      base = base.filter(item => selectedTags.every(tag => item.tags.includes(tag)));
    }

    const query = debouncedTextQuery.trim().toLowerCase();
    if (query) {
      base = base.filter(item => {
        return (
          item.japanese.toLowerCase().includes(query) ||
          item.hiragana.toLowerCase().includes(query) ||
          item.romaji.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query)) ||
          item.translation.some(tr => tr.translation.toLowerCase().includes(query))
        );
      });
    }

    return base;
  }, [selectedTags, debouncedTextQuery]);

  const isFiltering = selectedTags.length > 0 || debouncedTextQuery.trim() !== "";

  const handleTagToggle = useCallback((tag: string) => {
    if (typeof tag !== 'string') return;
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleTagAdd = useCallback((tag: string) => {
    if (typeof tag !== 'string') return;
    setSelectedTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
  }, []);

  const handleTagRemove = useCallback((tag: string) => {
    if (typeof tag !== 'string') return;
    setSelectedTags(prev => prev.filter(t => t !== tag));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTags([]);
    setTextQuery("");
  }, []);

  const handleSelectWord = useCallback((item: VocabularyItem) => {
    setTextQuery(item.romaji);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(t("canvas.copySuccess"), "success");
    }).catch(() => {
      showNotification(t("canvas.copyError"), "error");
    });
  }, [t, showNotification]);

  const subtitle = useMemo(() => {
    if (!isFiltering) return t("vocabulary.subtitle");
    if (selectedTags.length === 1 && !debouncedTextQuery.trim()) {
      const tag = selectedTags[0];
      if (typeof tag !== 'string') return t("vocabulary.subtitle");
      return t(`vocabulary.categories.${tag}`, { defaultValue: tag });
    }
    return t("vocabulary.subtitle");
  }, [isFiltering, selectedTags, debouncedTextQuery, t]);

  return (
    <>
      <NavBar title={t("vocabulary.title")} />
      <div className="container vocabulary-container">
        <header className="home-header">
          <h1 className="title">{t("vocabulary.title")}</h1>
          <p className="subtitle">{subtitle}</p>

          <div className="vocabulary-controls">
          <SearchBar
            allTags={themes}
            selectedTags={selectedTags}
            textQuery={textQuery}
            vocabulary={vocabularyData}
            placeholder={t("vocabulary.search")}
            onTextChange={setTextQuery}
            onAddTag={handleTagAdd}
            onRemoveTag={handleTagRemove}
            onSelectWord={handleSelectWord}
            onClearAll={handleClearAll}
          />

        </div>

        {themes.length > 0 && (
          <TagSelector
            tags={themes}
            activeTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        )}
      </header>

      {!isFiltering ? (
        <div className="vocabulary-grid">
          {themes.map(theme => (
            <ThemeCard
              key={theme}
              theme={theme}
              count={themeCounts[theme]}
              onClick={handleTagAdd}
            />
          ))}
          <ThemeCard
            theme="coming-soon"
            count={0}
            onClick={() => {}}
            isComingSoon
          />
        </div>
      ) : (
        <div className="word-grid">
          {filteredVocabulary.map(item => (
            <WordCard
              key={`${item.japanese}-${item.romaji}-${item.tags.join('-')}`}
              item={item}
              langFlags={langFlags}
              activeTags={selectedTags}
              onTagClick={handleTagToggle}
              onCopy={handleCopy}
              copyTitle={t("canvas.copyTitle")}
            />
          ))}
          {filteredVocabulary.length === 0 && (
            <div className="no-results glass-panel">
              <div className="no-results-icon">∅</div>
              <p>{t("vocabulary.noResults")}</p>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};
