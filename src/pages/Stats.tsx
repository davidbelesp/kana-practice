import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { allKanaData } from "../data/kana";
import { kanjiLevels } from "../data/kanjiManifest";
import { AppShell } from "../components/ui/AppShell";
import { getTrainingRecommendations, useProgressSnapshot } from "../utils/progressRepository";
import type { LearningDomain, ProgressItem } from "../types/Progress";
import "./Stats.css";

const NUMBER_GROUPS = ["1", "2", "3", "4", "5", "6", "7"];
const dayLabel = (timestamp: number) => new Date(timestamp).toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
const scoreClass = (score: number) => score >= 85 ? "level-4" : score >= 60 ? "level-3" : score >= 30 ? "level-2" : score > 0 ? "level-1" : "level-0";
const domainLabelKey = (domain: LearningDomain) => `stats.domains.${domain}`;

const groupSessionsByDay = (sessions: Array<{ completedAt: number; correct: number; incorrect: number }>) => {
  const grouped = new Map<number, { timestamp: number; correct: number; wrong: number }>();
  sessions.forEach((session) => {
    const date = new Date(session.completedAt);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const current = grouped.get(day) ?? { timestamp: day, correct: 0, wrong: 0 };
    current.correct += session.correct;
    current.wrong += session.incorrect;
    grouped.set(day, current);
  });
  return [...grouped.values()].sort((a, b) => a.timestamp - b.timestamp).slice(-14);
};

const itemsFor = (items: ProgressItem[], domain: LearningDomain) => items.filter((item) => item.domain === domain);

export const Stats = () => {
  const { t } = useTranslation();
  const snapshot = useProgressSnapshot();
  const recommendations = useMemo(() => getTrainingRecommendations(), [snapshot.updatedAt]);
  const items = Object.values(snapshot.items);
  const sessions = Object.values(snapshot.sessions);
  const totals = useMemo(() => sessions.reduce((result, session) => ({ correct: result.correct + session.correct, incorrect: result.incorrect + session.incorrect }), { correct: 0, incorrect: 0 }), [sessions]);
  const attempts = totals.correct + totals.incorrect;
  const accuracy = attempts ? Math.round((totals.correct / attempts) * 100) : 0;
  const bestStreak = items.reduce((best, item) => Math.max(best, item.streak), 0);
  const activeStreak = useMemo(() => {
    const latest = Math.max(...items.map((item) => item.lastTrainedAt ?? 0), 0);
    return latest && Date.now() - latest < 48 * 60 * 60 * 1000 ? Math.max(...items.filter((item) => item.lastTrainedAt === latest).map((item) => item.streak), 0) : 0;
  }, [items]);
  const activity = useMemo(() => groupSessionsByDay(sessions), [sessions]);
  const kanaItems = itemsFor(items, "kana");
  const kanjiItems = itemsFor(items, "kanji");
  const vocabularyItems = itemsFor(items, "vocabulary");
  const numberItems = itemsFor(items, "numbers");
  const hasProgress = attempts > 0 || items.length > 0;
  const hiragana = allKanaData.filter((item) => item.char.charCodeAt(0) < 0x30a0);
  const katakana = allKanaData.filter((item) => item.char.charCodeAt(0) >= 0x30a0);
  const kanaMap = new Map(kanaItems.map((item) => [item.itemId, item]));

  const renderHeatmap = (label: string, characters: typeof allKanaData) => (
    <div className="progress-heatmap-group">
      <div className="progress-subheading"><span>{label}</span><span className="progress-count">{characters.filter((item) => (kanaMap.get(item.char)?.masteryScore ?? 0) > 0).length}/{characters.length}</span></div>
      <div className="kana-heatmap" aria-label={label}>{characters.map((item) => { const score = kanaMap.get(item.char)?.masteryScore ?? 0; return <Link key={item.char} to={`/practice?char=${encodeURIComponent(item.char)}`} className={`heatmap-tile ${scoreClass(score)}`} title={`${item.char} · ${score}%`}><span>{item.char}</span><small>{item.romaji}</small></Link>; })}</div>
    </div>
  );

  return (
    <AppShell title={t("stats.title")}>
      <div className="progress-container">
        <header className="progress-hero"><div><span className="eyebrow">STUDIO / COMMAND CENTER</span><h1>{t("stats.title")}</h1><p>{t("stats.subtitle")}</p></div><Link className="btn-primary" to={recommendations[0]?.actionPath ?? "/practice"}>{t("stats.startPractice")}</Link></header>
        <section className="progress-kpis" aria-label={t("stats.title")}><article className="progress-kpi accent-kpi"><span>{t("stats.overallAccuracy")}</span><strong>{accuracy}%</strong><small>{attempts} {t("stats.answered")}</small></article><article className="progress-kpi"><span>{t("stats.questionsAnswered")}</span><strong>{attempts}</strong><small>{totals.correct} {t("stats.chart.correct").toLowerCase()}</small></article><article className="progress-kpi"><span>{t("stats.quizzesFinished")}</span><strong>{sessions.length}</strong><small>{sessions.length === 1 ? t("stats.session") : t("stats.sessions")}</small></article><article className="progress-kpi"><span>{t("stats.currentStreak")}</span><strong>{activeStreak}</strong><small>{t("stats.bestStreak")}: {bestStreak}</small></article></section>
        {!hasProgress && <section className="progress-empty glass-panel"><span className="progress-empty-mark">◎</span><div><h2>{t("stats.noProgress")}</h2><p>{t("stats.noProgressDescription")}</p></div><Link className="btn-primary" to="/practice">{t("stats.startPractice")}</Link></section>}
        <section className="progress-recommendation-grid"><article className="progress-panel next-session-panel glass-panel"><div className="panel-heading"><div><span className="eyebrow">RECOMMENDATION</span><h2>{t("stats.nextSession")}</h2></div><span className="recommendation-spark">✦</span></div>{recommendations[0] && <div className="next-session-content"><span className="recommendation-domain">{t(domainLabelKey(recommendations[0].domain))}</span><p>{t(recommendations[0].descriptionKey)}</p><Link className="btn-primary" to={recommendations[0].actionPath}>{t("stats.openRecommendation")}</Link></div>}</article><div className="recommendation-secondary">{recommendations.slice(1).map((recommendation) => <Link className="recommendation-row glass-panel" key={recommendation.domain} to={recommendation.actionPath}><span><strong>{t(recommendation.titleKey)}</strong><small>{t(recommendation.descriptionKey)}</small></span><span>→</span></Link>)}</div></section>
        <div className="progress-layout">
          <section className="progress-panel progress-chart-panel glass-panel"><div className="panel-heading"><div><span className="eyebrow">14 DAY WINDOW</span><h2>{t("stats.recentActivity")}</h2></div></div><div className="progress-chart">{activity.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={activity} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--studio-border)" strokeDasharray="3 3" /><XAxis dataKey="timestamp" tickFormatter={dayLabel} stroke="var(--studio-muted)" tickLine={false} axisLine={false} /><YAxis stroke="var(--studio-muted)" tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={{ background: "var(--studio-panel-raised)", border: "1px solid var(--studio-border)", borderRadius: "12px", color: "var(--studio-text)" }} labelFormatter={(label) => dayLabel(Number(label))} /><Legend /><Bar dataKey="correct" name={t("stats.chart.correct")} fill="var(--accent-primary)" stackId="answers" radius={[5, 5, 0, 0]} /><Bar dataKey="wrong" name={t("stats.chart.wrong")} fill="var(--accent-secondary)" stackId="answers" /></BarChart></ResponsiveContainer> : <div className="panel-placeholder">{t("stats.noHistory")}</div>}</div></section>
          <section className="progress-panel glass-panel domain-overview-panel"><div className="panel-heading"><div><span className="eyebrow">LEARNING MAP</span><h2>{t("stats.domainProgress")}</h2></div></div><div className="domain-progress-list">{(["kana", "kanji", "vocabulary", "numbers"] as LearningDomain[]).map((domain) => { const domainItems = itemsFor(items, domain); const mastered = domainItems.filter((item) => item.masteryScore >= 85).length; const total = domainItems.length; const domainSessions = sessions.filter((session) => session.domain === domain).length; return <Link to={domain === "kana" ? "/practice" : `/${domain}`} className="domain-progress-row" key={domain}><span className={`domain-dot domain-${domain}`} /><span><strong>{t(domainLabelKey(domain))}</strong><small>{mastered}/{total} {t("stats.masteredShort")} · {domainSessions} {t("stats.sessions")}</small></span><b>{total ? Math.round((mastered / total) * 100) : 0}%</b></Link>; })}</div></section>
          <section className="progress-panel glass-panel progress-wide-panel"><div className="panel-heading"><div><span className="eyebrow">CHARACTER MAP</span><h2>{t("stats.kanaMastery")}</h2></div></div>{renderHeatmap(t("stats.hiragana"), hiragana)}{renderHeatmap(t("stats.katakana"), katakana)}</section>
          <section className="progress-panel glass-panel"><div className="panel-heading"><div><span className="eyebrow">JLPT PATH</span><h2>{t("stats.kanjiMastery")}</h2></div><Link className="btn-text" to="/kanji">{t("stats.openDomain")} →</Link></div><div className="level-progress-list">{kanjiLevels.map((level) => { const levelSet = new Set(level.characters); const mastered = kanjiItems.filter((item) => levelSet.has(item.itemId) && item.masteryScore >= 85).length; return <div className="level-progress-row" key={level.level}><span>{level.level}</span><div className="progress-track"><i style={{ width: `${level.count ? (mastered / level.count) * 100 : 0}%` }} /></div><strong>{mastered}/{level.count}</strong></div>; })}</div></section>
          <section className="progress-panel glass-panel"><div className="panel-heading"><div><span className="eyebrow">VOCABULARY HUB</span><h2>{t("stats.vocabularyProgress")}</h2></div><Link className="btn-text" to="/vocabulary">{t("stats.openDomain")} →</Link></div><div className="domain-stat-large"><strong>{vocabularyItems.filter((item) => item.masteryScore >= 85).length}</strong><span>{t("stats.wordsMastered")}</span></div><p className="panel-muted">{vocabularyItems.length ? t("stats.wordsPracticed", { count: vocabularyItems.length }) : t("stats.vocabularyNoData")}</p></section>
          <section className="progress-panel glass-panel progress-wide-panel"><div className="panel-heading"><div><span className="eyebrow">NUMBER LAB</span><h2>{t("stats.numbersProgress")}</h2></div><Link className="btn-text" to="/numbers">{t("stats.openDomain")} →</Link></div>{numberItems.length ? <div className="number-progress-list">{NUMBER_GROUPS.map((group) => { const item = numberItems.find((entry) => entry.itemId === `range-${group}`); if (!item) return null; const total = item.correct + item.incorrect; return <div className="number-progress-row" key={group}><span>{t("stats.digitGroup", { group })}</span><div className="progress-track"><i style={{ width: `${item.masteryScore}%` }} /></div><strong>{item.masteryScore}%</strong><small>{total}</small></div>; })}</div> : <div className="panel-placeholder">{t("stats.numbersNoData")}</div>}</section>
          <section className="progress-panel glass-panel"><div className="panel-heading"><div><span className="eyebrow">FUTURE PATH</span><h2>{t("stats.grammarProgress")}</h2></div></div><div className="panel-placeholder"><span className="coming-soon-mark">文</span><span>{t("stats.grammarComingSoon")}</span></div></section>
          <section className="progress-panel glass-panel progress-wide-panel"><div className="panel-heading"><div><span className="eyebrow">RECENT LOG</span><h2>{t("stats.recentSessions")}</h2></div></div>{sessions.length ? <div className="session-list">{sessions.sort((a, b) => b.completedAt - a.completedAt).slice(0, 8).map((session) => <div className="session-row" key={session.id}><span>{t(domainLabelKey(session.domain))}</span><small>{session.mode}</small><strong>{session.correct}/{session.total}</strong><small>{session.accuracy}%</small><time>{dayLabel(session.completedAt)}</time></div>)}</div> : <div className="panel-placeholder">{t("stats.noHistory")}</div>}</section>
        </div>
      </div>
    </AppShell>
  );
};
