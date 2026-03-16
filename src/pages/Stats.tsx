import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAggregates,
  getTopStreaks,
  getMasteredKana,
  getHistory,
  type KanaStat,
  type QuizResult,
} from "../utils/statsManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Stats.css";

interface AggregateData {
  totalQuizzes: number;
  totalCorrect: number;
  totalWrong: number;
  globalAccuracy: number;
}

export const Stats = () => {
  const navigate = useNavigate();
  const [aggregates] = useState<AggregateData | null>(getAggregates);
  const [topStreaks] = useState<KanaStat[]>(() => getTopStreaks(5));
  const [mastered] = useState<KanaStat[]>(getMasteredKana);
  const [history] = useState<QuizResult[]>(() => {
    const rawHistory = getHistory();

    const dailyMap = new Map<string, QuizResult>();

    rawHistory.forEach((result) => {
      const date = new Date(result.timestamp);
      const key = date.toLocaleDateString();

      if (!dailyMap.has(key)) {
        dailyMap.set(key, { ...result, timestamp: date.setHours(0, 0, 0, 0) });
      } else {
        const current = dailyMap.get(key)!;
        dailyMap.set(key, {
          ...current,
          correct: current.correct + result.correct,
          wrong: current.wrong + result.wrong,
          total: current.total + result.total,
        });
      }
    });

    const aggregatedHistory = Array.from(dailyMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    return aggregatedHistory;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
    });
  };

  if (!aggregates) return null;

  return (
    <div className="container stats-container">
      <header className="stats-header">
        <button
          className="btn-secondary back-btn"
          onClick={() => navigate("/")}
        >
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

      {/* Mastered Kana Section */}
      <section className="stats-section">
        <h2>🏆 Mastered Kana (100+ Streak)</h2>
        {mastered.length === 0 ? (
          <div className="glass-panel empty-panel">
            <p>No mastered characters yet. Keep practicing!</p>
          </div>
        ) : (
          <div className="streaks-list glass-panel mastered-list">
            {mastered.map((s) => (
              <div key={s.char} className="streak-item mastered-item">
                <span className="char">{s.char}</span>
                <div className="streak-info">
                  <span className="trophy">🏆</span>
                  <span className="count">{s.streak}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quiz History Graph */}
      <section className="stats-section">
        <h2>📈 Quiz History (Daily)</h2>
        <div className="glass-panel chart-panel" style={{ height: 400 }}>
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={history}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                  stroke="rgba(255,255,255,0.5)"
                />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Bar
                  dataKey="correct"
                  name="Correct"
                  fill="#10b981"
                  stackId="a"
                />
                <Bar dataKey="wrong" name="Wrong" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No history available yet.</p>
          )}
        </div>
      </section>

      <section className="stats-section">
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
