import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { allKanaData } from "../data/kana";
import {
  getAggregates,
  getHistory,
  getKanaStats,
  getMasteredKana,
  getMasteredStatus,
  getNumberStats,
  getWeakestChars,
  type KanaStat,
  type NumberGroupStat,
  type QuizResult,
} from "../utils/statsManager";
import { AppShell } from "../components/ui/AppShell";
import "./Stats.css";

const NUMBER_GROUPS = [
  { key: "1", label: "1 – 9" },
  { key: "2", label: "10 – 99" },
  { key: "3", label: "100 – 999" },
  { key: "4", label: "1,000 – 9,999" },
  { key: "5", label: "10,000 – 99,999" },
  { key: "6", label: "100,000 – 999,999" },
  { key: "7", label: "1,000,000" },
];

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

const aggregateByDay = (history: QuizResult[]) => {
  const byDay = new Map<string, QuizResult>();

  history.forEach((result) => {
    const date = new Date(result.timestamp);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const current = byDay.get(String(day));

    byDay.set(String(day), current
      ? {
          ...current,
          correct: current.correct + result.correct,
          wrong: current.wrong + result.wrong,
          total: current.total + result.total,
        }
      : { ...result, timestamp: day });
  });

  return Array.from(byDay.values()).sort((a, b) => a.timestamp - b.timestamp).slice(-14);
};

const masteryScore = (stat?: KanaStat, isMastered = false) => {
  if (isMastered || stat?.streak && stat.streak >= 100) return 100;
  if (!stat) return 0;
  const attempts = stat.correct + stat.incorrect;
  if (!attempts) return 0;
  return Math.min(99, Math.round((stat.correct / attempts) * 70 + Math.min(stat.streak / 20, 1) * 30));
};

const masteryLevel = (score: number) => {
  if (score >= 85) return "level-4";
  if (score >= 60) return "level-3";
  if (score >= 30) return "level-2";
  if (score > 0) return "level-1";
  return "level-0";
};

export const Stats = () => {
  const { t } = useTranslation();
  const snapshot = useMemo(() => {
    const aggregates = getAggregates();
    const kanaStats = getKanaStats();
    const masteredStatus = getMasteredStatus();
    const mastered = getMasteredKana();
    const history = getHistory();
    const numberStats = getNumberStats();
    const questionsAnswered = aggregates.totalCorrect + aggregates.totalWrong;
    const bestStreak = Object.values(kanaStats).reduce((best, stat) => Math.max(best, stat.streak), 0);

    return {
      aggregates,
      kanaStats,
      masteredStatus,
      mastered,
      history,
      numberStats,
      questionsAnswered,
      bestStreak,
      activity: aggregateByDay(history),
      weakest: getWeakestChars(6).map((char) => ({ char, stat: kanaStats[char] })),
    };
  }, []);

  const hasProgress = snapshot.questionsAnswered > 0 || snapshot.history.length > 0 || Object.keys(snapshot.kanaStats).length > 0;
  const groupedKana = useMemo(() => ({
    hiragana: allKanaData.filter((kana) => kana.char && kana.char.charCodeAt(0) < 0x30a0),
    katakana: allKanaData.filter((kana) => kana.char && kana.char.charCodeAt(0) >= 0x30a0),
  }), []);

  const renderKanaHeatmap = (label: string, kana: typeof allKanaData) => (
    <div className="progress-heatmap-group">
      <div className="progress-subheading">
        <span>{label}</span>
        <span className="progress-count">{kana.filter((item) => masteryScore(snapshot.kanaStats[item.char], snapshot.masteredStatus[item.char]) > 0).length}/{kana.length}</span>
      </div>
      <div className="kana-heatmap" aria-label={label}>
        {kana.map((item) => {
          const score = masteryScore(snapshot.kanaStats[item.char], snapshot.masteredStatus[item.char]);
          return (
            <Link
              key={item.char}
              to={`/practice?char=${encodeURIComponent(item.char)}`}
              className={`heatmap-tile ${masteryLevel(score)}`}
              title={`${item.char} · ${item.romaji} · ${score}%`}
            >
              <span>{item.char}</span>
              <small>{item.romaji}</small>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <AppShell title={t("stats.title")}>
      <div className="progress-container">
        <header className="progress-hero">
          <div>
            <span className="eyebrow">STUDIO / COMMAND CENTER</span>
            <h1>{t("stats.title")}</h1>
            <p>{t("stats.subtitle")}</p>
          </div>
          <Link className="btn-primary" to="/practice">{t("stats.startPractice")}</Link>
        </header>

        <section className="progress-kpis" aria-label={t("stats.title")}>
          <article className="progress-kpi accent-kpi">
            <span>{t("stats.overallAccuracy")}</span>
            <strong>{snapshot.aggregates.globalAccuracy}%</strong>
            <small>{snapshot.questionsAnswered} {t("stats.answered")}</small>
          </article>
          <article className="progress-kpi">
            <span>{t("stats.questionsAnswered")}</span>
            <strong>{snapshot.questionsAnswered}</strong>
            <small>{snapshot.aggregates.totalCorrect} {t("stats.chart.correct").toLowerCase()}</small>
          </article>
          <article className="progress-kpi">
            <span>{t("stats.quizzesFinished")}</span>
            <strong>{snapshot.aggregates.totalQuizzes}</strong>
            <small>{snapshot.aggregates.totalQuizzes === 1 ? t("stats.session") : t("stats.sessions")}</small>
          </article>
          <article className="progress-kpi">
            <span>{t("stats.bestStreak")}</span>
            <strong>{snapshot.bestStreak}</strong>
            <small>{t("stats.masteredTitle").replace(/\s*\(.*/, "")}</small>
          </article>
        </section>

        {!hasProgress && (
          <section className="progress-empty glass-panel">
            <span className="progress-empty-mark">◎</span>
            <div>
              <h2>{t("stats.noProgress")}</h2>
              <p>{t("stats.noProgressDescription")}</p>
            </div>
            <Link className="btn-primary" to="/practice">{t("stats.startPractice")}</Link>
          </section>
        )}

        <div className="progress-layout">
          <section className="progress-panel progress-chart-panel glass-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">14 DAY WINDOW</span><h2>{t("stats.recentActivity")}</h2></div>
              <span className="panel-signal" />
            </div>
            <div className="progress-chart">
              {snapshot.activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={snapshot.activity} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--studio-border)" strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="var(--studio-muted)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--studio-muted)" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--studio-panel-raised)", border: "1px solid var(--studio-border)", borderRadius: "12px", color: "var(--studio-text)" }}
                      labelFormatter={(label) => formatDate(Number(label))}
                    />
                    <Legend />
                    <Bar dataKey="correct" name={t("stats.chart.correct")} fill="var(--accent-primary)" stackId="answers" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="wrong" name={t("stats.chart.wrong")} fill="var(--accent-secondary)" stackId="answers" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="panel-placeholder">{t("stats.noHistory")}</div>}
            </div>
          </section>

          <section className="progress-panel glass-panel next-session-panel">
            <div className="panel-heading"><div><span className="eyebrow">RECOMMENDATION</span><h2>{t("stats.nextSession")}</h2></div></div>
            <div className="next-session-content">
              <div className="next-session-orbit">かな</div>
              <p>{t("stats.nextSessionDescription")}</p>
              <Link className="btn-secondary" to="/practice?mode=weakest">{t("stats.practiceWeakest")}</Link>
            </div>
          </section>

          <section className="progress-panel glass-panel progress-wide-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">CHARACTER MAP</span><h2>{t("stats.kanaMastery")}</h2></div>
              <div className="heatmap-legend"><span className="legend-swatch level-0" />0<span className="legend-swatch level-2" />50<span className="legend-swatch level-4" />100</div>
            </div>
            {renderKanaHeatmap(t("stats.hiragana"), groupedKana.hiragana)}
            {renderKanaHeatmap(t("stats.katakana"), groupedKana.katakana)}
          </section>

          <section className="progress-panel glass-panel">
            <div className="panel-heading"><div><span className="eyebrow">FOCUS QUEUE</span><h2>{t("stats.weakCharacters")}</h2></div></div>
            {snapshot.weakest.length > 0 ? (
              <div className="focus-list">
                {snapshot.weakest.map(({ char, stat }) => (
                  <Link className="focus-row" key={char} to={`/practice?char=${encodeURIComponent(char)}`}>
                    <span className="focus-char">{char}</span>
                    <span className="focus-romaji">{allKanaData.find((item) => item.char === char)?.romaji}</span>
                    <span className="focus-score">{stat ? `${stat.correct}/${stat.correct + stat.incorrect}` : "—"}</span>
                  </Link>
                ))}
              </div>
            ) : <div className="panel-placeholder">{t("stats.noStreaks")}</div>}
            <Link className="btn-text" to="/practice?mode=weakest">{t("stats.practiceWeakest")} →</Link>
          </section>

          <section className="progress-panel glass-panel">
            <div className="panel-heading"><div><span className="eyebrow">MILESTONES</span><h2>{t("stats.masteredCharacters")}</h2></div><strong className="panel-total">{snapshot.mastered.length}</strong></div>
            {snapshot.mastered.length > 0 ? (
              <div className="mastered-grid">
                {snapshot.mastered.slice(0, 12).map((stat) => <Link key={stat.char} to={`/practice?char=${encodeURIComponent(stat.char)}`} className="mastered-tile"><span>{stat.char}</span><small>{stat.streak}</small></Link>)}
              </div>
            ) : <div className="panel-placeholder">{t("stats.noMastered")}</div>}
          </section>

          <section className="progress-panel glass-panel progress-wide-panel">
            <div className="panel-heading"><div><span className="eyebrow">NUMBER LAB</span><h2>{t("stats.numbersProgress")}</h2></div><Link className="btn-text" to="/numbers">Open lab →</Link></div>
            {Object.keys(snapshot.numberStats).length > 0 ? (
              <div className="number-progress-list">
                {NUMBER_GROUPS.map(({ key, label }) => {
                  const stat: NumberGroupStat | undefined = snapshot.numberStats[key];
                  if (!stat) return null;
                  const total = stat.correct + stat.incorrect;
                  const percent = total ? Math.round((stat.correct / total) * 100) : 0;
                  return <div className="number-progress-row" key={key}><span>{label}</span><div className="progress-track"><i style={{ width: `${percent}%` }} /></div><strong>{percent}%</strong><small>{total}</small></div>;
                })}
              </div>
            ) : <div className="panel-placeholder">{t("stats.numbersNoData")}</div>}
          </section>

          <section className="progress-panel glass-panel">
            <div className="panel-heading"><div><span className="eyebrow">RECENT LOG</span><h2>{t("stats.recentSessions")}</h2></div></div>
            {snapshot.history.length > 0 ? <div className="session-list">{snapshot.history.slice(0, 5).map((session) => <div className="session-row" key={session.timestamp}><span>{formatDate(session.timestamp)}</span><strong>{session.correct}/{session.total}</strong><small>{session.total ? Math.round((session.correct / session.total) * 100) : 0}%</small></div>)}</div> : <div className="panel-placeholder">{t("stats.noHistory")}</div>}
          </section>
        </div>
      </div>
    </AppShell>
  );
};
