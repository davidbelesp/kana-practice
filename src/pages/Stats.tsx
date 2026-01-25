import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAggregates,
  getTopStreaks,
  type KanaStat,
} from "../utils/statsManager";
import "./Stats.css";

interface AggregateData {
  totalQuizzes: number;
  totalCorrect: number;
  totalWrong: number;
  globalAccuracy: number;
}

export const Stats = () => {
  const navigate = useNavigate();
  const [aggregates, setAggregates] = useState<AggregateData | null>(null);
  const [topStreaks, setTopStreaks] = useState<KanaStat[]>([]);

  useEffect(() => {
    setAggregates(getAggregates());
    setTopStreaks(getTopStreaks(5));
  }, []);

  if (!aggregates) return null;

  return (
    <div className="container stats-container">
      <header className="stats-header">
        <button className="btn-text" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>Your Progress</h1>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Quizzes Finished</div>
          <div className="stat-value">{aggregates.totalQuizzes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value">{aggregates.globalAccuracy}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Correct</div>
          <div className="stat-value text-success">
            {aggregates.totalCorrect}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Wrong</div>
          <div className="stat-value text-danger">{aggregates.totalWrong}</div>
        </div>
      </div>

      <section className="top-streaks-section">
        <h2>🔥 Top Streaks</h2>
        {topStreaks.length === 0 ? (
          <p className="no-data">Start practicing to build your streaks!</p>
        ) : (
          <div className="streaks-list glass-panel">
            {topStreaks.map((s, i) => (
              <div key={s.char} className="streak-item">
                <span className="rank">#{i + 1}</span>
                <span className="char">{s.char}</span>
                <span className="count">{s.streak}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
