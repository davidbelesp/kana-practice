import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { HiraganaTable } from "../components/HiraganaTable";
import { hiraganaData, katakanaData } from "../data/kana";
import {
  getWeakestChars,
  getKanaStats,
  getMasteredStatus,
  saveMasteredStatus,
  type KanaStat,
} from "../utils/statsManager";
import { NavBar } from "../components/ui/NavBar";
import "./Home.css";

type Tab = "hiragana" | "katakana";

export const Home = () => {
  const { t } = useTranslation();
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("hiragana");
  const [stats, setStats] = useState<Record<string, KanaStat>>({});
  const [masteredKanas, setMasteredKanas] = useState<Record<string, boolean>>(
    {},
  );
  const navigate = useNavigate();

  useEffect(() => {
    const currentStats = getKanaStats();
    setStats(currentStats);

    // Backfill mastery for existing streaks
    Object.values(currentStats).forEach((stat) => {
      if (stat.streak >= 100) {
        saveMasteredStatus(stat.char);
      }
    });

    setMasteredKanas(getMasteredStatus());
  }, []);

  const currentData = useMemo(
    () => (activeTab === "hiragana" ? hiraganaData : katakanaData),
    [activeTab]
  );

  const currentChars = useMemo(
    () => currentData.filter((k) => !k.isEmpty).map((k) => k.char),
    [currentData]
  );

  const handleToggleChar = useCallback((char: string) => {
    setSelectedChars((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char],
    );
  }, []);

  const handleToggleGroup = useCallback((chars: string[], shouldSelect: boolean) => {
    setSelectedChars((prev) => {
      const set = new Set(prev);
      chars.forEach((c) => {
        if (shouldSelect) set.add(c);
        else set.delete(c);
      });
      return Array.from(set);
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedChars((prev) => {
      const set = new Set([...prev, ...currentChars]);
      return Array.from(set);
    });
  }, [currentChars]);

  const handleSelectWeakest = useCallback(() => {
    const weakest = getWeakestChars(10, currentChars);
    if (weakest.length > 0) {
      setSelectedChars(weakest);
    }
  }, [currentChars]);

  const handleDeselectAll = useCallback(() => {
    setSelectedChars([]);
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (selectedChars.length < 3) return;
    navigate("/quiz", { state: { selectedChars, from: "/practice" } });
  }, [navigate, selectedChars]);

  return (
    <>
      <NavBar title={t("home.title")}>
        <div className="tab-switch">
          <div className={classNames("tab-slider", activeTab)} />
          <button
            className={classNames("tab-btn", { active: activeTab === "hiragana" })}
            onClick={() => setActiveTab("hiragana")}
          >
            {t("home.tabs.hiragana")}
          </button>
          <button
            className={classNames("tab-btn", { active: activeTab === "katakana" })}
            onClick={() => setActiveTab("katakana")}
          >
            {t("home.tabs.katakana")}
          </button>
        </div>
      </NavBar>
      <div className="home-container container">

      <div className="controls glass-panel">
        <div className="selection-info">
          <span className="count">
            {t("home.controls.selected", { count: selectedChars.length })}
          </span>
        </div>
        <div className="actions">
          <button className="btn-secondary" onClick={handleSelectAll}>
            {t("common.all")} ({t(`home.tabs.${activeTab}`)})
          </button>
          <button
            className="btn-secondary"
            onClick={handleSelectWeakest}
          >
            {t("home.controls.weakest10")}
          </button>
          <button className="btn-secondary" onClick={handleDeselectAll}>
            {t("common.clear")}
          </button>
          <button
            className="btn-primary start-btn"
            onClick={handleStartQuiz}
            disabled={selectedChars.length < 3}
          >
            {t("home.controls.startQuiz")}{" "}
            {selectedChars.length > 0 && `(${selectedChars.length})`}
          </button>
        </div>
      </div>

      <HiraganaTable
        data={currentData}
        selectedChars={selectedChars}
        onToggleChar={handleToggleChar}
        onToggleGroup={handleToggleGroup}
        stats={stats}
        masteredKanas={masteredKanas}
      />
      </div>
    </>
  );
};
