import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import "./Home.css";

type Tab = "hiragana" | "katakana";

export const Home = () => {
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

  const currentData = activeTab === "hiragana" ? hiraganaData : katakanaData;

  /* ... existing handlers ... */
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

  /* ... existing handlers ... */
  const handleSelectAll = () => {
    const currentChars = currentData
      .filter((k) => !k.isEmpty)
      .map((k) => k.char);
    setSelectedChars((prev) => {
      const set = new Set([...prev, ...currentChars]);
      return Array.from(set);
    });
  };

  const handleSelectWeakest = () => {
    const currentChars = currentData
      .filter((k) => !k.isEmpty)
      .map((k) => k.char);
    const weakest = getWeakestChars(10, currentChars);
    if (weakest.length > 0) {
      setSelectedChars(weakest);
    }
  };

  const handleDeselectAll = () => {
    setSelectedChars([]);
  };

  const handleStartQuiz = () => {
    if (selectedChars.length < 3) return;
    navigate("/quiz", { state: { selectedChars, from: "/practice" } });
  };

  return (
    <div className="home-container container">
      <header className="home-header">
        <div className="home-header-top">
          <button className="btn-secondary" onClick={() => navigate("/")}>← Back</button>
        </div>
        <h1 className="title">Kana Practice</h1>
        <p className="subtitle">Select characters to master</p>
      </header>

      <div className="tab-container">
        <div className="tab-switch">
          <div className={classNames("tab-slider", activeTab)} />
          <button
            className={classNames("tab-btn", {
              active: activeTab === "hiragana",
            })}
            onClick={() => setActiveTab("hiragana")}
          >
            Hiragana
          </button>
          <button
            className={classNames("tab-btn", {
              active: activeTab === "katakana",
            })}
            onClick={() => setActiveTab("katakana")}
          >
            Katakana
          </button>
        </div>
      </div>

      <div className="controls glass-panel">
        <div className="selection-info">
          <span className="count">{selectedChars.length} selected</span>
        </div>
        <div className="actions">
          <button className="btn-text" onClick={handleSelectAll}>
            All ({activeTab})
          </button>
          <button
            className="btn-text"
            onClick={handleSelectWeakest}
            title="Select 10 characters you struggle with most"
          >
            Weakest 10
          </button>
          <button className="btn-text" onClick={handleDeselectAll}>
            None
          </button>
          <button
            className="btn-primary start-btn"
            onClick={handleStartQuiz}
            disabled={selectedChars.length < 3}
          >
            Start Quiz {selectedChars.length > 0 && `(${selectedChars.length})`}
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
  );
};
