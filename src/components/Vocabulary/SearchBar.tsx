import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { VocabularyItem } from "../../types/Vocabulary";
import { getCategory } from "../../data/categories";

interface SearchBarProps {
  allTags: string[];
  selectedTags: string[];
  textQuery: string;
  vocabulary: VocabularyItem[];
  placeholder: string;
  onTextChange: (q: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSelectWord: (item: VocabularyItem) => void;
  onClearAll: () => void;
}

const MAX_TAGS = 8;
const MAX_WORDS = 6;

export const SearchBar: React.FC<SearchBarProps> = ({
  allTags,
  selectedTags,
  textQuery,
  vocabulary,
  placeholder,
  onTextChange,
  onAddTag,
  onRemoveTag,
  onSelectWord,
  onClearAll
}) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = i18n.language.split("-")[0];

  const suggestions = useMemo(() => {
    const q = textQuery.trim().toLowerCase();
    if (!q) return { tags: [] as string[], starting: [] as VocabularyItem[], containing: [] as VocabularyItem[] };

    const matchingTags = allTags
      .filter(tag => !selectedTags.includes(tag))
      .filter(tag => {
        const label = String(t(`vocabulary.categories.${tag}`, { defaultValue: tag })).toLowerCase();
        return tag.toLowerCase().includes(q) || label.includes(q);
      })
      .slice(0, MAX_TAGS);

    const starting: VocabularyItem[] = [];
    const containing: VocabularyItem[] = [];
    for (const item of vocabulary) {
      const fields = [
        item.japanese,
        item.hiragana,
        item.romaji,
        ...item.translation.map(tr => tr.translation)
      ].map(f => f.toLowerCase());

      if (fields.some(f => f.startsWith(q))) {
        starting.push(item);
      } else if (fields.some(f => f.includes(q))) {
        containing.push(item);
      }
      if (starting.length >= MAX_WORDS && containing.length >= MAX_WORDS) break;
    }

    return {
      tags: matchingTags,
      starting: starting.slice(0, MAX_WORDS),
      containing: containing.slice(0, MAX_WORDS)
    };
  }, [textQuery, vocabulary, allTags, selectedTags, t]);

  const totalSuggestions =
    suggestions.tags.length + suggestions.starting.length + suggestions.containing.length;
  const showDropdown = open && textQuery.trim().length > 0 && totalSuggestions > 0;
  const hasAnything = selectedTags.length > 0 || textQuery.length > 0;

  const handleWordClick = (item: VocabularyItem) => {
    onSelectWord(item);
    setOpen(false);
  };

  const handleTagSuggestionClick = (tag: string) => {
    onAddTag(tag);
    onTextChange("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`search-bar-tagged glass-panel ${showDropdown ? 'has-dropdown' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <span className="search-icon">🔍</span>

      <div className="search-bar-input-area">
        {selectedTags.map(tag => {
          if (typeof tag !== 'string') return null;
          const { color } = getCategory(tag);
          return (
            <button
              key={tag}
              type="button"
              className="search-bar-chip"
              onClick={(e) => { e.stopPropagation(); onRemoveTag(tag); }}
              style={{
                '--tag-color': color,
                '--tag-bg': `${color}26`,
                '--tag-border': `${color}66`
              } as React.CSSProperties}
              title={t("common.clear")}
            >
              <span className="search-bar-chip-label">
                {t(`vocabulary.categories.${tag}`, { defaultValue: tag })}
              </span>
              <span className="search-bar-chip-x" aria-hidden="true">×</span>
            </button>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          value={textQuery}
          onFocus={() => setOpen(true)}
          onChange={(e) => { onTextChange(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && textQuery === "" && selectedTags.length > 0) {
              onRemoveTag(selectedTags[selectedTags.length - 1]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </div>

      {hasAnything && (
        <button
          className="clear-search"
          onClick={(e) => { e.stopPropagation(); onClearAll(); }}
          title={t("common.clear")}
        >
          ✕
        </button>
      )}

      {showDropdown && (
        <div className="search-bar-dropdown" onClick={(e) => e.stopPropagation()}>
          {suggestions.tags.length > 0 && (
            <div className="dropdown-section dropdown-section-tags">
              <div className="dropdown-heading">{t("vocabulary.suggest.tags")}</div>
              <div className="dropdown-tag-row">
                {suggestions.tags.map(tag => {
                  const { color } = getCategory(tag);
                  return (
                    <button
                      key={`tag-${tag}`}
                      className="dropdown-tag-pill"
                      onClick={() => handleTagSuggestionClick(tag)}
                      style={{
                        background: `${color}26`,
                        color,
                        borderColor: `${color}66`
                      }}
                    >
                      #{t(`vocabulary.categories.${tag}`, { defaultValue: tag })}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {suggestions.starting.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-heading">{t("vocabulary.suggest.startingWith")}</div>
              {suggestions.starting.map((item, i) => {
                const tr = item.translation.find(tr => tr.lang === currentLang) || item.translation[0];
                return (
                  <button
                    key={`start-${item.romaji}-${i}`}
                    className="dropdown-item"
                    onClick={() => handleWordClick(item)}
                  >
                    {item.image && <span className="dropdown-emoji">{item.image}</span>}
                    <span className="dropdown-jp">{item.japanese}</span>
                    <span className="dropdown-romaji">{item.romaji}</span>
                    <span className="dropdown-meaning">{tr?.translation}</span>
                  </button>
                );
              })}
            </div>
          )}

          {suggestions.containing.length > 0 && (
            <div className="dropdown-section">
              <div className="dropdown-heading">{t("vocabulary.suggest.containing")}</div>
              {suggestions.containing.map((item, i) => {
                const tr = item.translation.find(tr => tr.lang === currentLang) || item.translation[0];
                return (
                  <button
                    key={`cont-${item.romaji}-${i}`}
                    className="dropdown-item"
                    onClick={() => handleWordClick(item)}
                  >
                    {item.image && <span className="dropdown-emoji">{item.image}</span>}
                    <span className="dropdown-jp">{item.japanese}</span>
                    <span className="dropdown-romaji">{item.romaji}</span>
                    <span className="dropdown-meaning">{tr?.translation}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
