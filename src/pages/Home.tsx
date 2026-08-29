import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiraganaTable } from "../components/HiraganaTable";
import { hiraganaData, katakanaData } from "../data/kana";
import {
  getWeakestChars,
  type KanaStat,
} from "../utils/statsManager";
import { useProgressSnapshot } from "../utils/progressRepository";
import { isKanaMastered } from "../utils/kanaMastery";
import { useSettings } from "../contexts/SettingsContext";
import { AppShell } from "../components/ui/AppShell";
import { prefetchRoute } from "../utils/routePrefetch";
import { IconButton } from "../components/ui/IconButton";
import { StudioSegmentedSwitch } from "../components/ui/StudioSegmentedSwitch";
import { CheckSquare, TrendingDown, Eraser } from "lucide-react";
import "./Home.css";

type Tab = "hiragana" | "katakana";

export const Home = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("hiragana");
  const [stats, setStats] = useState<Record<string, KanaStat>>({});
  const progressSnapshot = useProgressSnapshot();
  const navigate = useNavigate();

  useEffect(() => {
    const currentStats: Record<string, KanaStat> = {};
    Object.values(progressSnapshot.items)
      .filter((item) => item.domain === "kana")
      .forEach((item) => {
        currentStats[item.itemId] = {
          char: item.itemId,
          correct: item.correct,
          incorrect: item.incorrect,
          streak: item.streak,
          masteryScore: item.masteryScore,
          lastPlayed: item.lastTrainedAt,
        };
    });
    setStats(currentStats);
  }, [progressSnapshot.items, progressSnapshot.updatedAt, settings.masteryThreshold]);

  const currentData = useMemo(
    () => (activeTab === "hiragana" ? hiraganaData : katakanaData),
    [activeTab],
  );

  const currentChars = useMemo(
    () => currentData.filter((k) => !k.isEmpty).map((k) => k.char),
    [currentData],
  );

  const masteredCount = useMemo(
    () => currentChars.filter((char) => isKanaMastered(stats[char]?.masteryScore ?? 0, settings.masteryThreshold)).length,
    [currentChars, settings.masteryThreshold, stats],
  );

  const handleToggleChar = useCallback((char: string) => {
    setSelectedChars((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char],
    );
  }, []);

  const handleToggleGroup = useCallback(
    (chars: string[], shouldSelect: boolean) => {
      setSelectedChars((prev) => {
        const set = new Set(prev);
        chars.forEach((c) => {
          if (shouldSelect) set.add(c);
          else set.delete(c);
        });
        return Array.from(set);
      });
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedChars((prev) => {
      const set = new Set([...prev, ...currentChars]);
      return Array.from(set);
    });
  }, [currentChars]);

  const handleSelectWeakest = useCallback(() => {
    const weakest = getWeakestChars(10, currentChars, stats);
    if (weakest.length > 0) {
      setSelectedChars(weakest);
    }
  }, [currentChars, stats]);

  const handleDeselectAll = useCallback(() => {
    setSelectedChars([]);
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (selectedChars.length < 3) return;
    navigate("/quiz", { state: { selectedChars, from: "/practice" } });
  }, [navigate, selectedChars]);

  return (
    <AppShell title={t("home.title")} centerSlot={
      <StudioSegmentedSwitch
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel={t("home.title")}
        sliderClassName={activeTab}
        options={[
          { value: "hiragana", label: t("home.tabs.hiragana") },
          { value: "katakana", label: t("home.tabs.katakana") },
        ]}
      />
    }>
      <div className="home-container container">
        <header className="practice-hero">
          <div>
            <span className="section-kicker">DAILY FOUNDATIONS</span>
            <h1>{t("home.title")}</h1>
            <p>{t("home.subtitle")}. {t("home.description")}</p>
          </div>
          <div className="practice-summary" aria-label="Practice summary">
            <div><strong>{masteredCount}</strong><span>{t("home.summary.mastered")}</span></div>
            <div><strong>{currentChars.length}</strong><span>{t("home.summary.available")}</span></div>
          </div>
        </header>
        <div className="controls glass-panel">
          <div className="selection-info">
            <span className="count">{t("home.controls.selected", { count: selectedChars.length })}</span>
          </div>
          <div className="actions">
            <IconButton
              icon={CheckSquare}
              label={`${t("common.all")} (${t(`home.tabs.${activeTab}`)})`}
              onClick={handleSelectAll}
            />
            <IconButton
              icon={TrendingDown}
              label={t("home.controls.weakest10")}
              onClick={handleSelectWeakest}
            />
            <IconButton
              icon={Eraser}
              label={t("common.clear")}
              onClick={handleDeselectAll}
            />
            <button
              className="btn-primary start-btn"
              onClick={handleStartQuiz}
              onMouseEnter={() => prefetchRoute("/quiz")}
              onFocus={() => prefetchRoute("/quiz")}
              onPointerDown={() => prefetchRoute("/quiz")}
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
          masteryThreshold={settings.masteryThreshold}
        />
      </div>
    </AppShell>
  );
};
