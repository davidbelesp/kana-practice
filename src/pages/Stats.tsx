import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAggregates,
  getTopStreaks,
  getMasteredKana,
  getHistory,
  getNumberStats,
  type KanaStat,
  type QuizResult,
  type NumberGroupStat,
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
import { NavBar } from "../components/ui/NavBar";
import "./Stats.css";

const NUMBER_GROUPS: { key: string; label: string }[] = [
  { key: "1", label: "1 – 9" },
  { key: "2", label: "10 – 99" },
  { key: "3", label: "100 – 999" },
  { key: "4", label: "1,000 – 9,999" },
  { key: "5", label: "10,000 – 99,999" },
  { key: "6", label: "100,000 – 999,999" },
  { key: "7", label: "1,000,000" },
];

interface AggregateData {
  totalQuizzes: number;
  totalCorrect: number;
  totalWrong: number;
  globalAccuracy: number;
}

export const Stats = () => {
  const { t } = useTranslation();

  const [aggregates] = useState<AggregateData | null>(getAggregates);
  const [numberStats] = useState<Record<string, NumberGroupStat>>(getNumberStats);
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
    <>
      <NavBar title={t("stats.title")} />
      <div className="container stats-container">
        <h1>{t("stats.title")}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t("stats.quizzesFinished")}</div>
          <div className="stat-value">{aggregates.totalQuizzes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("stats.accuracy")}</div>
          <div className="stat-value">{aggregates.globalAccuracy}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("stats.totalCorrect")}</div>
          <div className="stat-value text-success">
            {aggregates.totalCorrect}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("stats.totalWrong")}</div>
          <div className="stat-value text-danger">{aggregates.totalWrong}</div>
        </div>
      </div>

      {/* Mastered Kana Section */}
      <section className="stats-section">
        <h2>🏆 {t("stats.masteredTitle")}</h2>
        {mastered.length === 0 ? (
          <div className="glass-panel empty-panel">
            <p>{t("stats.noMastered")}</p>
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
        <h2>📈 {t("stats.historyTitle")}</h2>
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
                  name={t("stats.chart.correct")}
                  fill="#10b981"
                  stackId="a"
                />
                <Bar 
                  dataKey="wrong" 
                  name={t("stats.chart.wrong")} 
                  fill="#ef4444" 
                  stackId="a" 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">{t("stats.noHistory")}</p>
          )}
        </div>
      </section>

      {/* Numbers Progress Section */}
      <section className="stats-section">
        <h2>🔢 {t("stats.numbersTitle")}</h2>
        {Object.keys(numberStats).length === 0 ? (
          <p className="no-data">{t("stats.numbersNoData")}</p>
        ) : (
          <div className="glass-panel number-stats-grid">
            {NUMBER_GROUPS.map(({ key, label }) => {
              const stat = numberStats[key];
              if (!stat) return null;
              const total = stat.correct + stat.incorrect;
              const pct = total > 0 ? Math.round((stat.correct / total) * 100) : 0;
              return (
                <div key={key} className="number-stat-row">
                  <span className="number-stat-range">{label}</span>
                  <div className="number-stat-bar-wrap">
                    <div className="number-stat-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="number-stat-pct">{pct}%</span>
                  <span className="number-stat-counts">
                    <span className="text-success">{stat.correct}</span>
                    {" / "}
                    <span className="text-danger">{stat.incorrect}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="stats-section">
        <h2>🔥 {t("stats.topStreaks")}</h2>
        {topStreaks.length === 0 ? (
          <p className="no-data">{t("stats.noStreaks")}</p>
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
    </>
  );
};
