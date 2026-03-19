import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import {
  n5kanjiData,
  n4kanjiData,
  n3kanjiData,
  n2kanjiData,
  n1kanjiData,
  type KanjiChar,
} from "../data/kanji";
import { KanjiModal } from "../components/KanjiModal";
import {
  getKanaStats,
  getMasteredStatus,
  saveMasteredStatus,
  type KanaStat,
} from "../utils/statsManager";
import { ChevronDown } from "lucide-react";
import "./KanjiPage.css";

const kanjiLevels = [
  { level: "N5", data: n5kanjiData },
  { level: "N4", data: n4kanjiData },
  { level: "N3", data: n3kanjiData },
  { level: "N2", data: n2kanjiData },
  { level: "N1", data: n1kanjiData },
];

interface KanjiCellProps {
  kanji: KanjiChar;
  isSelected: boolean;
  isMastered: boolean;
  onClick: (kanji: KanjiChar) => void;
}

const KanjiCell = React.memo(({ kanji, isSelected, isMastered, onClick }: KanjiCellProps) => {
  return (
    <button
      className={classNames("kanji-cell", {
        selected: isSelected,
        golden: isMastered,
      })}
      onClick={() => onClick(kanji)}
    >
      <span className="kanji-char-text">{kanji.char}</span>
    </button>
  );
});

export const KanjiPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});
  const [activeModalKanji, setActiveModalKanji] = useState<KanjiChar | null>(null);
  const [stats, setStats] = useState<Record<string, KanaStat>>({});
  const [masteredKanas, setMasteredKanas] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const selectedCharsSet = useMemo(() => new Set(selectedChars), [selectedChars]);

  useEffect(() => {
    const currentStats = getKanaStats();
    setStats(currentStats);

    Object.values(currentStats).forEach((stat) => {
      if (stat.streak >= 100) {
        saveMasteredStatus(stat.char);
      }
    });

    setMasteredKanas(getMasteredStatus());
  }, []);

  const handleKanjiClick = useCallback((kanji: KanjiChar) => {
    if (isSelectionMode) {
      setSelectedChars((prev) =>
        prev.includes(kanji.char)
          ? prev.filter((c) => c !== kanji.char)
          : [...prev, kanji.char]
      );
    } else {
      setActiveModalKanji(kanji);
    }
  }, [isSelectionMode]);

  const closeModal = () => {
    setActiveModalKanji(null);
  };

  const handleStartQuiz = () => {
    if (selectedChars.length < 3) return;
    navigate("/kanji-quiz", { state: { selectedChars } });
  };
  
  const handleClearSelection = () => {
    setSelectedChars([]);
  };

  const handleSelectLevel = (levelChars: string[], shouldSelect: boolean) => {
    setSelectedChars((prev) => {
      const set = new Set(prev);
      levelChars.forEach((c) => {
        if (shouldSelect) set.add(c);
        else set.delete(c);
      });
      return Array.from(set);
    });
  };

  const toggleLevelCollapse = (level: string) => {
    setCollapsedLevels((prev) => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="container kanji-page-container">
      <header className="home-header">
        <h1 className="title">{t("kanji.title")}</h1>
        <p className="subtitle">{t("kanji.subtitle")}</p>
        <div className="secondary-actions">
          <Link to="/" className="btn-secondary link-btn">
            ← {t("common.home") || "Home"}
          </Link>
        </div>
      </header>

      <div className="controls glass-panel kanji-controls">
        <div className="tab-switch kanji-mode-switch">
          <div className={classNames("tab-slider", { "selection-mode": isSelectionMode })} />
          <button
            className={classNames("tab-btn mode-btn", { active: !isSelectionMode })}
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedChars([]);
            }}
          >
            {t("kanji.modes.view")}
          </button>
          <button
            className={classNames("tab-btn mode-btn", { active: isSelectionMode })}
            onClick={() => setIsSelectionMode(true)}
          >
            {t("kanji.modes.select")}
          </button>
        </div>

        {isSelectionMode && (
          <div className="selection-actions">
            <span className="count">
               {t("home.controls.selected", { count: selectedChars.length })}
            </span>
             <button className="btn-text" onClick={handleClearSelection}>
                {t("common.clear")}
            </button>
            <button
              className="btn-primary start-btn kanji-start-btn"
              onClick={handleStartQuiz}
              disabled={selectedChars.length < 3}
            >
              {t("home.controls.startQuiz")}{" "}
              {selectedChars.length > 0 && `(${selectedChars.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="kanji-levels-container">
        {kanjiLevels.map(({ level, data }) => {
          const isCollapsed = !!collapsedLevels[level];
          return (
          <section key={level} className="kanji-level-section">
            <div className="level-header">
              <div className="level-title-section">
                <h2>JLPT {level}</h2>
                <span className="level-count">
                  {t("kanji.levelCount", { count: data.length })}
                </span>
              </div>
              <div className="level-controls-group">
                {isSelectionMode && (
                  <div className="level-actions">
                      <button 
                        className="btn-text btn-small"
                        onClick={() => handleSelectLevel(data.map(k => k.char), true)}
                      >
                        {t("kanji.selectAll")}
                      </button>
                      <button 
                        className="btn-text btn-small"
                        onClick={() => handleSelectLevel(data.map(k => k.char), false)}
                      >
                        {t("kanji.deselect")}
                      </button>
                  </div>
                )}
                <button 
                  className="btn-icon collapse-btn"
                  onClick={() => toggleLevelCollapse(level)}
                  title={isCollapsed ? t("kanji.expand") : t("kanji.collapse")}
                >
                  <ChevronDown 
                    size={24} 
                    className={classNames("collapse-icon", {
                      "collapsed": isCollapsed
                    })} 
                  />
                </button>
              </div>
            </div>
            
            <div 
              className={classNames("kanji-grid-wrapper", {
                collapsed: isCollapsed
              })}
            >
              <div className="kanji-grid">
                {data.map((k) => {
                  const isSelected = selectedCharsSet.has(k.char);
                  const charStat = stats[k.char];
                  const streak = charStat?.streak || 0;
                  const isMastered = streak >= 100 || !!masteredKanas[k.char];

                  return (
                    <KanjiCell
                      key={k.char}
                      kanji={k}
                      isSelected={isSelected}
                      isMastered={isMastered}
                      onClick={handleKanjiClick}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )})}
      </div>

      {activeModalKanji && (
        <KanjiModal kanji={activeModalKanji} onClose={closeModal} />
      )}
    </div>
  );
};
;
