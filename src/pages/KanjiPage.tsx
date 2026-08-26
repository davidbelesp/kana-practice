import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { ChevronDown, Search, X } from "lucide-react";
import { AppShell } from "../components/ui/AppShell";
import { StudioSegmentedSwitch } from "../components/ui/StudioSegmentedSwitch";
import { prefetchRoute } from "../utils/routePrefetch";
import { KanjiModal } from "../components/KanjiModal";
import { kanjiLevels, totalKanjiCount, type KanjiLevelId } from "../data/kanjiManifest";
import { allKanjiCharacters } from "../data/kanjiCharacterManifest";
import type { KanjiChar } from "../data/kanjiTypes";
import {
  loadKanjiSearchIndex,
  resetKanjiSearchIndex,
  searchKanjiRecords,
  type KanjiSearchLoadResult,
  type KanjiSearchRecord,
} from "../data/kanjiSearch";
import type { KanaStat } from "../utils/statsManager";
import { useProgressSnapshot } from "../utils/progressRepository";
import "./KanjiPage.css";

const LEVEL_BATCH_SIZE = 48;
const LEVEL_REVEAL_DELAY = 42;

type KanjiLevelState = {
  status: "idle" | "loading" | "ready" | "error";
  total: number;
  loadedCount: number;
  items: KanjiChar[];
  visibleItems: KanjiChar[];
  batchStart: number;
  error?: string;
};

const initialLevelStates = Object.fromEntries(
  kanjiLevels.map(({ level, count }) => [level, {
    status: "idle",
    total: count,
    loadedCount: 0,
    items: [],
    visibleItems: [],
    batchStart: 0,
  }]),
) as unknown as Record<KanjiLevelId, KanjiLevelState>;

interface KanjiCellProps {
  kanji: KanjiChar;
  isSelected: boolean;
  isMastered: boolean;
  isEntering: boolean;
  onClick: (kanji: KanjiChar) => void;
}

const KanjiCell = React.memo(({ kanji, isSelected, isMastered, isEntering, onClick }: KanjiCellProps) => (
  <button
    type="button"
    className={classNames("kanji-cell", {
      selected: isSelected,
      golden: isMastered,
      "kanji-cell--entering": isEntering,
    })}
    onClick={() => onClick(kanji)}
    aria-label={kanji.char}
  >
    <span className="kanji-char-text">{kanji.char}</span>
  </button>
));

const initialCollapsedLevels = Object.fromEntries(
  kanjiLevels.map(({ level }) => [level, true]),
) as Record<KanjiLevelId, boolean>;

export const KanjiPage: React.FC = () => {
  const { t, i18n } = useTranslation(["translation", "kanji_meanings"]);
  const navigate = useNavigate();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [collapsedLevels, setCollapsedLevels] = useState<Record<KanjiLevelId, boolean>>(initialCollapsedLevels);
  const [levelStates, setLevelStates] = useState<Record<KanjiLevelId, KanjiLevelState>>(initialLevelStates);
  const [activeModalKanji, setActiveModalKanji] = useState<KanjiChar | null>(null);
  const [activeModalLevel, setActiveModalLevel] = useState<KanjiLevelId | null>(null);
  const [stats, setStats] = useState<Record<string, KanaStat>>({});
  const [masteredKanas, setMasteredKanas] = useState<Record<string, boolean>>({});
  const levelCacheRef = useRef(new Map<KanjiLevelId, KanjiChar[]>());
  const levelPromisesRef = useRef(new Map<KanjiLevelId, Promise<KanjiChar[]>>());
  const revealTimersRef = useRef(new Map<KanjiLevelId, number>());
  const searchPromiseRef = useRef<Promise<KanjiSearchLoadResult> | null>(null);
  const searchLanguageRef = useRef<string | null>(null);
  const searchRequestRef = useRef(0);
  const suppressSearchOpenRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KanjiSearchRecord[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);
  const progressSnapshot = useProgressSnapshot();

  const selectedCharsSet = useMemo(() => new Set(selectedChars), [selectedChars]);
  const knownKanjiSet = useMemo<Set<string>>(() => new Set(allKanjiCharacters), []);
  const masteredCount = useMemo(
    () => Object.values(stats).filter((stat) => knownKanjiSet.has(stat.char) && (stat.streak >= 100 || stat.correct > 0 && stat.correct / Math.max(1, stat.correct + stat.incorrect) >= .85)).length,
    [knownKanjiSet, stats],
  );

  const ensureSearchIndex = useCallback(() => {
    if (searchPromiseRef.current && searchLanguageRef.current === i18n.language) {
      return searchPromiseRef.current;
    }

    setSearchStatus("loading");
    setSearchError("");
    searchLanguageRef.current = i18n.language;
    const promise = loadKanjiSearchIndex(
      i18n.language,
      (character, fallback) => t(`kanji_meanings:${character}`, { defaultValue: fallback }),
    )
      .then((result) => {
        setSearchStatus(result.records.length > 0 ? "ready" : "error");
        setSearchError(result.failedLevels.length > 0 ? t("kanji.searchPartialError") : "");
        return result;
      })
      .catch((error: unknown) => {
        setSearchStatus("error");
        setSearchError(error instanceof Error ? error.message : t("kanji.searchError"));
        throw error;
      });

    searchPromiseRef.current = promise;
    return promise;
  }, [i18n.language, t]);

  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = ++searchRequestRef.current;
    if (!query) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearchActiveIndex(-1);
      return undefined;
    }

    const suppressOpen = suppressSearchOpenRef.current;
    suppressSearchOpenRef.current = false;
    if (!suppressOpen) setSearchOpen(true);
    setSearchActiveIndex(-1);
    const timer = window.setTimeout(() => {
      void ensureSearchIndex()
        .then((result) => {
          if (requestId !== searchRequestRef.current) return;
          setSearchResults(searchKanjiRecords(result.records, query));
        })
        .catch(() => {
          if (requestId === searchRequestRef.current) setSearchResults([]);
        });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [ensureSearchIndex, searchQuery]);

  useEffect(() => {
    const currentStats: Record<string, KanaStat> = {};
    Object.values(progressSnapshot.items).filter((item) => item.domain === "kanji").forEach((item) => {
      currentStats[item.itemId] = { char: item.itemId, correct: item.correct, incorrect: item.incorrect, streak: item.streak, lastPlayed: item.lastTrainedAt };
    });
    setStats(currentStats);
    setMasteredKanas(Object.fromEntries(Object.values(currentStats).filter((stat) => stat.streak >= 100).map((stat) => [stat.char, true])));
  }, [progressSnapshot.items, progressSnapshot.updatedAt]);

  useEffect(() => () => {
    revealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    revealTimersRef.current.clear();
  }, []);

  const revealLevelItems = useCallback((level: KanjiLevelId, data: KanjiChar[]) => {
    let cursor = 0;

    const revealNextBatch = () => {
      cursor = Math.min(cursor + LEVEL_BATCH_SIZE, data.length);
      setLevelStates((current) => ({
        ...current,
        [level]: {
          ...current[level],
          status: cursor >= data.length ? "ready" : "loading",
          loadedCount: cursor,
          visibleItems: data.slice(0, cursor),
          batchStart: Math.max(0, cursor - LEVEL_BATCH_SIZE),
        },
      }));

      if (cursor < data.length) {
        const timer = window.setTimeout(revealNextBatch, LEVEL_REVEAL_DELAY);
        revealTimersRef.current.set(level, timer);
      } else {
        revealTimersRef.current.delete(level);
      }
    };

    revealNextBatch();
  }, []);

  const loadLevel = useCallback((level: KanjiLevelId) => {
    const cachedData = levelCacheRef.current.get(level);
    if (cachedData) return Promise.resolve(cachedData);

    const existingPromise = levelPromisesRef.current.get(level);
    if (existingPromise) return existingPromise;

    const descriptor = kanjiLevels.find((entry) => entry.level === level);
    if (!descriptor) return Promise.reject(new Error(`Unknown Kanji level ${level}`));

    setLevelStates((current) => ({
      ...current,
      [level]: {
        ...current[level],
        status: "loading",
        loadedCount: 0,
        visibleItems: [],
        batchStart: 0,
        error: undefined,
      },
    }));

    const promise = descriptor.load()
      .then((data) => {
        levelCacheRef.current.set(level, data);
        setLevelStates((current) => ({
          ...current,
          [level]: {
            ...current[level],
            status: "loading",
            total: data.length,
            items: data,
            loadedCount: 0,
            visibleItems: [],
            batchStart: 0,
          },
        }));
        revealLevelItems(level, data);
        return data;
      })
      .catch((error) => {
        setLevelStates((current) => ({
          ...current,
          [level]: {
            ...current[level],
            status: "error",
            error: error instanceof Error ? error.message : String(error),
          },
        }));
        throw error;
      })
      .finally(() => {
        levelPromisesRef.current.delete(level);
      });

    levelPromisesRef.current.set(level, promise);
    return promise;
  }, [revealLevelItems]);

  const handleKanjiClick = useCallback((kanji: KanjiChar, level: KanjiLevelId) => {
    if (isSelectionMode) {
      setSelectedChars((previous) => previous.includes(kanji.char)
        ? previous.filter((char) => char !== kanji.char)
        : [...previous, kanji.char]);
      return;
    }

    setActiveModalKanji(kanji);
    setActiveModalLevel(level);
  }, [isSelectionMode]);

  const openSearchResult = useCallback((result: KanjiSearchRecord) => {
    suppressSearchOpenRef.current = true;
    setSearchQuery(result.kanji.char);
    setSearchOpen(false);
    setSearchActiveIndex(-1);
    setActiveModalKanji(result.kanji);
    setActiveModalLevel(result.level);
  }, []);

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setSearchActiveIndex((current) => Math.min(current + 1, searchResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && searchActiveIndex >= 0 && searchResults[searchActiveIndex]) {
      event.preventDefault();
      openSearchResult(searchResults[searchActiveIndex]);
    } else if (event.key === "Escape") {
      setSearchOpen(false);
      setSearchActiveIndex(-1);
    }
  }, [openSearchResult, searchActiveIndex, searchResults]);

  const handleSearchRetry = useCallback(() => {
    resetKanjiSearchIndex();
    searchPromiseRef.current = null;
    searchLanguageRef.current = null;
    void ensureSearchIndex();
  }, [ensureSearchIndex]);

  const closeModal = useCallback(() => {
    setActiveModalKanji(null);
    setActiveModalLevel(null);
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (selectedChars.length < 3) return;
    navigate("/kanji-quiz", { state: { selectedChars } });
  }, [navigate, selectedChars]);

  const handleSelectLevel = useCallback((level: KanjiLevelId, shouldSelect: boolean) => {
    void loadLevel(level).then((data) => {
      setSelectedChars((previous) => {
        const selected = new Set(previous);
        data.forEach((kanji) => shouldSelect ? selected.add(kanji.char) : selected.delete(kanji.char));
        return Array.from(selected);
      });
    }).catch(() => undefined);
  }, [loadLevel]);

  const toggleLevelCollapse = useCallback((level: KanjiLevelId) => {
    const nextCollapsed = !collapsedLevels[level];
    setCollapsedLevels((previous) => ({ ...previous, [level]: nextCollapsed }));
    if (!nextCollapsed) void loadLevel(level).catch(() => undefined);
  }, [collapsedLevels, loadLevel]);

  const focusLevel = useCallback((level: KanjiLevelId) => {
    setCollapsedLevels(Object.fromEntries(
      kanjiLevels.map(({ level: current }) => [current, current !== level]),
    ) as Record<KanjiLevelId, boolean>);
    void loadLevel(level).catch(() => undefined);
  }, [loadLevel]);

  return (
    <AppShell title={t("kanji.title")}>
      <div className="container kanji-page-container">
        <header className="kanji-hero">
          <div>
            <span className="section-kicker">JLPT PATH</span>
            <h1>{t("kanji.title")}</h1>
            <p>{t("kanji.subtitle")}. Browse by level, open a character, or build a focused practice set.</p>
          </div>
          <div className="kanji-summary" aria-label="Kanji summary">
            <div><strong>{selectedChars.length}</strong><span>{t("kanji.selectedSummary")}</span></div>
            <div><strong>{masteredCount}</strong><span>{t("kanji.masteredSummary")}</span></div>
            <div><strong>{totalKanjiCount}</strong><span>{t("kanji.totalSummary")}</span></div>
          </div>
        </header>

        <div className="controls glass-panel kanji-controls">
          <div className="kanji-search-shell">
            <div className="kanji-search-field-wrap">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchInputRef}
                id="kanji-search-input"
                className="kanji-search-input"
                type="search"
                role="combobox"
                value={searchQuery}
                placeholder={t("kanji.searchPlaceholder")}
                aria-label={t("kanji.searchLabel")}
                aria-autocomplete="list"
                aria-controls="kanji-search-results"
                aria-expanded={searchOpen}
                aria-activedescendant={searchActiveIndex >= 0 ? `kanji-search-result-${searchActiveIndex}` : undefined}
                onFocus={() => { void ensureSearchIndex(); if (searchQuery.trim()) setSearchOpen(true); }}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {searchQuery && (
                <button type="button" className="kanji-search-clear" onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }} aria-label={t("kanji.clearSearch")}>
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>
            {searchOpen && (
              <div id="kanji-search-results" className="kanji-search-results" role="listbox" aria-label={t("kanji.searchResults")}>
                {searchStatus === "loading" && <div className="kanji-search-state" aria-live="polite">{t("kanji.searchLoading")}</div>}
                {searchStatus === "error" && (
                  <div className="kanji-search-state kanji-search-state--error" role="alert">
                    <span>{searchError || t("kanji.searchError")}</span>
                    <button type="button" className="btn-text" onClick={handleSearchRetry}>{t("common.retry")}</button>
                  </div>
                )}
                {searchStatus === "ready" && searchError && <div className="kanji-search-warning">{searchError}</div>}
                {searchStatus === "ready" && searchQuery.trim() && searchResults.length === 0 && <div className="kanji-search-state">{t("kanji.noSearchResults")}</div>}
                {searchResults.map((result, index) => {
                  const reading = result.kanji.furigana.kunyomi[0] || result.kanji.furigana.onyomi[0] || "";
                  return (
                    <button
                      type="button"
                      role="option"
                      id={`kanji-search-result-${index}`}
                      key={`${result.level}-${result.kanji.char}`}
                      aria-selected={searchActiveIndex === index}
                      className={classNames("kanji-search-result", { active: searchActiveIndex === index })}
                      onMouseDown={(event) => { event.preventDefault(); openSearchResult(result); }}
                    >
                      <span className="kanji-search-result-character">{result.kanji.char}</span>
                      <span className="kanji-search-result-copy">
                        <strong>{result.localizedMeaning || result.englishMeaning}</strong>
                        <small>{reading}{result.localizedMeaning && result.localizedMeaning !== result.englishMeaning ? ` · ${result.englishMeaning}` : ""}</small>
                      </span>
                      <span className="kanji-search-result-level">{result.level}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="kanji-controls-row">
            <StudioSegmentedSwitch
              value={isSelectionMode ? "select" : "view"}
              onChange={(value) => {
                const selection = value === "select";
                setIsSelectionMode(selection);
                if (!selection) setSelectedChars([]);
              }}
              ariaLabel={t("kanji.modes.view")}
              className="kanji-mode-switch"
              sliderClassName={isSelectionMode ? "selection-mode" : undefined}
              options={[
                { value: "view", label: t("kanji.modes.view") },
                { value: "select", label: t("kanji.modes.select") },
              ]}
            />
            {isSelectionMode && (
              <div className="selection-actions">
                <span className="count">{t("home.controls.selected", { count: selectedChars.length })}</span>
                <button type="button" className="btn-text" onClick={() => setSelectedChars([])}>{t("common.clear")}</button>
                <button type="button" className="btn-primary start-btn kanji-start-btn" onClick={handleStartQuiz} onMouseEnter={() => prefetchRoute("/kanji-quiz")} onFocus={() => prefetchRoute("/kanji-quiz")} onPointerDown={() => prefetchRoute("/kanji-quiz")} disabled={selectedChars.length < 3}>
                  {t("home.controls.startQuiz")} {selectedChars.length > 0 && `(${selectedChars.length})`}
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="kanji-level-nav" aria-label={t("kanji.levelNavigation")}>
          {kanjiLevels.map(({ level, count }) => (
            <button type="button" key={level} className="kanji-level-nav-btn" onClick={() => focusLevel(level)}>
              <strong>{level}</strong><span>{count}</span>
            </button>
          ))}
        </nav>

        <div className="kanji-levels-container">
          {kanjiLevels.map(({ level, count }) => {
            const isCollapsed = collapsedLevels[level];
            const state = levelStates[level];
            const isLoading = state.status === "loading";
            const hasError = state.status === "error";
            const skeletonCount = isLoading
              ? Math.min(32, Math.max(12, Math.ceil((state.total - state.loadedCount) / 18)))
              : 0;

            return (
              <section key={level} className="kanji-level-section">
                <div className="level-header">
                  <div className="level-title-section">
                    <div>
                      <span className="level-kicker">JLPT LEVEL</span>
                      <h2>{level}</h2>
                    </div>
                    <span className="level-count">{t("kanji.levelCount", { count })}</span>
                  </div>
                  <div className="level-controls-group">
                    {isSelectionMode && (
                      <div className="level-actions">
                        <button type="button" className="btn-text btn-small" onClick={() => handleSelectLevel(level, true)}>{t("kanji.selectAll")}</button>
                        <button type="button" className="btn-text btn-small" onClick={() => handleSelectLevel(level, false)}>{t("kanji.deselect")}</button>
                      </div>
                    )}
                    <button type="button" className="btn-icon collapse-btn" onClick={() => toggleLevelCollapse(level)} title={isCollapsed ? t("kanji.expand") : t("kanji.collapse")} aria-expanded={!isCollapsed}>
                      <ChevronDown size={20} className={classNames("collapse-icon", { collapsed: isCollapsed })} />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="kanji-grid-wrapper">
                    {hasError ? (
                      <div className="kanji-level-message kanji-level-message--error" role="alert">
                        <span>{t("kanji.loadError")}</span>
                        <button type="button" className="btn-text" onClick={() => void loadLevel(level).catch(() => undefined)}>{t("common.retry")}</button>
                      </div>
                    ) : (
                      <>
                        {isLoading && (
                          <div className="kanji-loading-progress" aria-live="polite">
                            <div className="kanji-loading-copy">
                              <span>{t("kanji.loadingLevel", { level })}</span>
                              <strong>{t("kanji.loadingProgress", { loaded: state.loadedCount, total: state.total })}</strong>
                            </div>
                            <div className="kanji-loading-bar" role="progressbar" aria-valuemin={0} aria-valuemax={state.total} aria-valuenow={state.loadedCount}>
                              <span style={{ width: `${state.total ? (state.loadedCount / state.total) * 100 : 0}%` }} />
                            </div>
                          </div>
                        )}
                        <div className="kanji-grid" aria-busy={isLoading}>
                          {state.visibleItems.map((kanji, index) => (
                            <KanjiCell
                              key={kanji.char}
                              kanji={kanji}
                              isSelected={selectedCharsSet.has(kanji.char)}
                              isMastered={(stats[kanji.char]?.streak ?? 0) >= 100 || !!masteredKanas[kanji.char]}
                              isEntering={isLoading && index >= state.batchStart}
                              onClick={(item) => handleKanjiClick(item, level)}
                            />
                          ))}
                          {Array.from({ length: skeletonCount }, (_, index) => <span key={`skeleton-${index}`} className="kanji-cell-skeleton" aria-hidden="true" />)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {activeModalKanji && <KanjiModal kanji={activeModalKanji} level={activeModalLevel ?? undefined} onClose={closeModal} />}
      </div>
    </AppShell>
  );
};
