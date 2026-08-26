import React, { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpDown, Check, ChevronDown, Copy, LayoutGrid, List, Play, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/ui/AppShell";
import { useNotification } from "../contexts/NotificationContext";
import { prefetchRoute } from "../utils/routePrefetch";
import { CATEGORY_SECTIONS, DICTIONARY_CATEGORIES, type DictionaryCategoryId } from "../data/dictionaryCategories";
import { searchVocabulary, type VocabularySearchResponse, type VocabularySortMode } from "../services/vocabularySearchClient";
import type { Translation, VocabularyItem } from "../types/Vocabulary";
import "./Vocabulary.css";

type Density = "cards" | "rows";
const BATCH_SIZE = 50;
const langFlags: Record<string, string> = { en: "EN", es: "ES" };

const getTranslation = (translations: Translation[], language: string) =>
  translations.find((entry) => entry.lang === language) ??
  translations.find((entry) => entry.lang === "en") ??
  translations[0];

const getCategory = (id: string) => DICTIONARY_CATEGORIES.find((category) => category.id === id);

export const Vocabulary: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [visibleResults, setVisibleResults] = useState<VocabularyItem[]>([]);
  const [searchState, setSearchState] = useState<"loading" | "ready" | "error">("loading");
  const [matchingEntryIds, setMatchingEntryIds] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<DictionaryCategoryId[]>([]);
  const [density, setDensity] = useState<Density>("cards");
  const [sortMode, setSortMode] = useState<VocabularySortMode>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(() => typeof window === "undefined" || window.innerWidth > 900);
  const [openFilterSection, setOpenFilterSection] = useState<(typeof CATEGORY_SECTIONS)[number]["id"] | null>(CATEGORY_SECTIONS[0].id);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(BATCH_SIZE);
  const [commandStuck, setCommandStuck] = useState(false);
  const commandRef = useRef<HTMLElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const latestSearchRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 360);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const updateStickyState = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const command = commandRef.current;
        if (!command) return;

        const stickyTop = Number.parseFloat(window.getComputedStyle(command).top) || 0;
        const isStuck = window.scrollY > 0
          && command.getBoundingClientRect().top <= stickyTop + 1;

        setCommandStuck((current) => current === isStuck ? current : isStuck);
      });
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  const currentLanguage = i18n.language.split("-")[0];
  const deferredQuery = useDeferredValue(query);
  const hasMore = visibleResults.length < totalResults;

  useEffect(() => {
    setVisibleLimit(BATCH_SIZE);
  }, [activeCategories, deferredQuery, sortMode]);

  useEffect(() => {
    const searchId = ++latestSearchRef.current;
    setSearchState("loading");

    searchVocabulary({
      query: deferredQuery,
      categories: activeCategories,
      sortMode,
      language: currentLanguage,
      limit: visibleLimit,
    }).then((response: VocabularySearchResponse) => {
      if (searchId !== latestSearchRef.current) return;
      if (response.status === "error") {
        setSearchState("error");
        return;
      }
      setVisibleResults(response.visibleEntries);
      setMatchingEntryIds(response.matchingEntryIds);
      setTotalResults(response.total);
      setTotalEntries(response.totalEntries);
      setCategoryCounts(response.categoryCounts);
      setSearchState("ready");
    }).catch(() => {
      if (searchId === latestSearchRef.current) setSearchState("error");
    });
  }, [activeCategories, currentLanguage, deferredQuery, sortMode, visibleLimit]);

  const loadMore = useCallback(() => {
    setVisibleLimit((current) => Math.min(current + BATCH_SIZE, totalResults));
  }, [totalResults]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((observations) => {
      if (observations.some((observation) => observation.isIntersecting)) loadMore();
    }, { rootMargin: "480px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const toggleCategory = useCallback((category: DictionaryCategoryId) => {
    setActiveCategories((current) => current.includes(category)
      ? current.filter((value) => value !== category)
      : [...current, category]);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setActiveCategories([]);
  }, []);

  const scrollToTop = useCallback(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, []);

  const copyWord = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => showNotification(t("canvas.copySuccess"), "success"),
      () => showNotification(t("canvas.copyError"), "error"),
    );
  }, [showNotification, t]);

  const quizEntryIds = matchingEntryIds;
  const canStartQuiz = quizEntryIds.length >= 4;

  const startVocabularyQuiz = useCallback(() => {
    if (!canStartQuiz) return;
    navigate("/vocabulary-quiz", { state: { entryIds: quizEntryIds, from: "/vocabulary" } });
  }, [canStartQuiz, navigate, quizEntryIds]);

  const renderEntry = (item: VocabularyItem, index: number) => {
    const translation = getTranslation(item.translation, currentLanguage);
    const example = item.examples?.[0];
    const exampleTranslation = example ? getTranslation(example.translation, currentLanguage) : undefined;
    return (
      <article
        className="dictionary-entry"
        key={item.id ?? `${item.japanese}-${item.romaji}`}
        style={{ animationDelay: `${Math.min(index, 11) * 32}ms` }}
      >
        <div className="dictionary-entry-main">
          <div className="dictionary-entry-top">
            <span className="dictionary-type">{item.type}</span>
            {item.jlpt && <span className="dictionary-jlpt">{item.jlpt}</span>}
            {item.loanword && <span className="dictionary-jlpt">カナ</span>}
          </div>
          <button className="dictionary-japanese" onClick={() => copyWord(item.japanese)} title={t("canvas.copyTitle")}>{item.japanese}</button>
          <div className="dictionary-reading">{item.hiragana} <span>/ {item.romaji || "—"}</span></div>
          <div className="dictionary-meaning"><span>{langFlags[translation?.lang ?? ""] ?? "JP"}</span>{translation?.translation}</div>
          {example && <div className="dictionary-example"><span>{example.japanese}</span><small>{exampleTranslation?.translation}</small></div>}
        </div>
        <div className="dictionary-entry-side" aria-label={t("vocabulary.secondaryInfo")}>
          {item.image && <span className="dictionary-emoji">{item.image}</span>}
          <button className="btn-icon dictionary-copy" onClick={() => copyWord(item.japanese)} aria-label={t("canvas.copyTitle")}><Copy size={16} /></button>
          <div className="dictionary-tags">{(item.categories ?? ["other"]).slice(0, 3).map((category) => <span key={category}>{t(getCategory(category)?.labelKey ?? "vocabulary.taxonomy.other")}</span>)}</div>
        </div>
      </article>
    );
  };

  return (
    <AppShell title={t("vocabulary.title")} className="vocabulary-shell">
      <div className="container dictionary-container">
        <header className="dictionary-hero">
          <div>
            <span className="section-kicker">REFERENCE LIBRARY</span>
            <h1>{t("vocabulary.title")}</h1>
            <p>{t("vocabulary.subtitle")}. {t("vocabulary.searchScope")}</p>
          </div>
          <div className="dictionary-stat"><strong>{totalEntries || "—"}</strong><span>{t("vocabulary.entries")}</span></div>
        </header>

        <section
          ref={commandRef}
          className={`dictionary-command glass-panel${commandStuck ? " is-stuck" : ""}`}
        >
          <div className="dictionary-search-line">
            <Search size={18} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("vocabulary.searchNew")} aria-label={t("vocabulary.searchNew")} />
            {query && <button className="btn-icon dictionary-clear" onClick={() => setQuery("")} aria-label={t("common.clear")}><X size={16} /></button>}
          </div>
          <div className="dictionary-toolbar">
            <button className={`btn-secondary filter-toggle ${filtersOpen ? "active" : ""}`} onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={16} />{t("vocabulary.filters")} {activeCategories.length > 0 && <span>{activeCategories.length}</span>}</button>
            <label className="dictionary-sort"><ArrowUpDown size={15} /><span>{t("vocabulary.sort")}</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value as VocabularySortMode)} aria-label={t("vocabulary.sort")}><option value="relevance">{t("vocabulary.sortRelevance")}</option><option value="japanese">{t("vocabulary.sortJapanese")}</option><option value="difficulty">{t("vocabulary.sortDifficulty")}</option><option value="category">{t("vocabulary.sortCategory")}</option></select></label>
            <div className="density-switch" role="group" aria-label={t("vocabulary.viewMode")}>
              <button className={density === "cards" ? "active" : ""} onClick={() => setDensity("cards")} aria-label={t("vocabulary.cardsView")} aria-pressed={density === "cards"}><LayoutGrid size={16} /></button>
              <button className={density === "rows" ? "active" : ""} onClick={() => setDensity("rows")} aria-label={t("vocabulary.rowsView")} aria-pressed={density === "rows"}><List size={16} /></button>
            </div>
          </div>
        </section>

        {(query || activeCategories.length > 0) && (
          <div className="dictionary-active-pills" aria-label={t("vocabulary.activeFilters")}>
            {activeCategories.map((categoryId) => {
              const category = getCategory(categoryId);
              return <button key={categoryId} onClick={() => toggleCategory(categoryId)}>{t(category?.labelKey ?? "vocabulary.taxonomy.other")} <X size={13} /></button>;
            })}
            {query && <span className="dictionary-query-pill">“{query}” <button onClick={() => setQuery("")} aria-label={t("common.clear")}><X size={13} /></button></span>}
            <button className="btn-text" onClick={clearSearch}>{t("vocabulary.clearFilters")}</button>
          </div>
        )}

        {filtersOpen && <button className="dictionary-scrim" onClick={() => setFiltersOpen(false)} aria-label={t("common.close")} />}

        <div className={`dictionary-layout ${filtersOpen ? "filters-open" : ""}`}>
          <aside className="dictionary-filters glass-panel">
            <div className="dictionary-filter-heading"><div><span className="section-kicker">FILTER BY</span><h2>{t("vocabulary.categoriesTitle")}</h2></div><button className="btn-icon mobile-filter-close" onClick={() => setFiltersOpen(false)} aria-label={t("common.close")}><X size={16} /></button></div>
            <button className={`dictionary-filter-btn ${activeCategories.length === 0 ? "active" : ""}`} onClick={() => setActiveCategories([])}><span>{t("vocabulary.allWords")}</span><strong>{totalEntries}</strong></button>
            {CATEGORY_SECTIONS.map((section) => (
              <div className="dictionary-category-section" key={section.id}>
                <button
                  className="dictionary-category-toggle"
                  onClick={() => setOpenFilterSection((current) => current === section.id ? null : section.id)}
                  aria-expanded={openFilterSection === section.id}
                  aria-controls={`dictionary-filter-section-${section.id}`}
                >
                  <h3>{t(section.labelKey)}</h3>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                <div id={`dictionary-filter-section-${section.id}`} className="dictionary-category-options" hidden={openFilterSection !== section.id}>
                  {DICTIONARY_CATEGORIES.filter((category) => category.section === section.id).map((category) => (
                    <button key={category.id} className={`dictionary-filter-btn ${activeCategories.includes(category.id) ? "active" : ""}`} onClick={() => toggleCategory(category.id)} title={t(category.descriptionKey)}>
                      <span>{t(category.labelKey)}</span><strong>{categoryCounts[category.id] ?? 0}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className={`dictionary-back-to-top ${showBackToTop ? "is-visible" : ""}`} onClick={scrollToTop} disabled={!showBackToTop} aria-label={t("vocabulary.backToTop")}>
              <ArrowUp size={15} aria-hidden="true" />
              <span>{t("vocabulary.backToTop")}</span>
            </button>
          </aside>

          <main className="dictionary-results-area">
            <div className="dictionary-results-head"><span>{searchState === "loading" ? t("vocabulary.loading") : t("vocabulary.showing", { count: visibleResults.length, total: totalResults })}</span>{(query || activeCategories.length > 0) && <span className="dictionary-active-filter"><Check size={13} />{t("vocabulary.filtered")}</span>}</div>
            {searchState === "loading" && visibleResults.length === 0 && <div className="dictionary-results dictionary-skeleton" aria-label={t("vocabulary.loading")} aria-busy="true">{Array.from({ length: 12 }, (_, index) => <div className="dictionary-skeleton-card" key={index} />)}</div>}
            {searchState === "error" && <div className="dictionary-empty glass-panel"><span>!</span><h2>{t("vocabulary.loadError")}</h2><p>{t("vocabulary.loadErrorHint")}</p></div>}
            {searchState === "ready" && totalResults === 0 && <div className="dictionary-empty glass-panel"><span>∅</span><h2>{t("vocabulary.noResults")}</h2><p>{t("vocabulary.emptyHint")}</p><button className="btn-primary" onClick={clearSearch}>{t("vocabulary.clearFilters")}</button></div>}
            {searchState === "ready" && totalResults > 0 && <>
              <div className={`dictionary-results density-${density}`}>
                {visibleResults.map(renderEntry)}
              </div>
              <div ref={loadMoreRef} className="dictionary-load-more">
                {hasMore && <button className="btn-secondary" onClick={loadMore}>{t("vocabulary.loadMore", { count: Math.min(BATCH_SIZE, totalResults - visibleResults.length) })}</button>}
                {hasMore && <span>{t("vocabulary.moreAvailable", { count: totalResults - visibleResults.length })}</span>}
                {!hasMore && totalResults > BATCH_SIZE && <span>{t("vocabulary.allLoaded")}</span>}
              </div>
            </>}
          </main>
        </div>
      </div>
      <button
        className={`vocabulary-quiz-fab ${canStartQuiz ? "" : "is-disabled"}`}
        onClick={startVocabularyQuiz}
        onMouseEnter={() => prefetchRoute("/vocabulary-quiz")}
        onFocus={() => prefetchRoute("/vocabulary-quiz")}
        onPointerDown={() => prefetchRoute("/vocabulary-quiz")}
        disabled={!canStartQuiz}
        title={canStartQuiz ? t("vocabulary.startQuiz") : t("vocabulary.quiz.minimumWords")}
        aria-label={canStartQuiz ? t("vocabulary.startQuiz") : t("vocabulary.quiz.minimumWords")}
      >
        <Play size={17} fill="currentColor" aria-hidden="true" />
        <span className="vocabulary-quiz-fab-label">{canStartQuiz ? t("vocabulary.startQuiz") : t("vocabulary.quiz.minimumWords")}</span>
        <strong>{quizEntryIds.length}</strong>
      </button>
    </AppShell>
  );
};
