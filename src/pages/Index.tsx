import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, BarChart3, BookMarked, BookOpen, Brush, ChevronRight, Layers, Sparkles, Target, Trophy } from "lucide-react";
import { hiraganaData, katakanaData } from "../data/kana";
import { totalKanjiCount } from "../data/kanjiManifest";
import { getAggregates, getMasteredKana } from "../utils/statsManager";
import { getTrainingRecommendations, useProgressSnapshot } from "../utils/progressRepository";
import type { ProgressItem } from "../types/Progress";
import { AppShell } from "../components/ui/AppShell";
import "./Index.css";

const sessions = [
  { to: "/practice", eyebrow: "01 / FOUNDATIONS", titleKey: "index.cards.practice", descKey: "index.cards.practiceDesc", Icon: BookOpen, tone: "lime", glyph: "あ" },
  { to: "/kanji", eyebrow: "02 / JLPT PATH", titleKey: "index.cards.kanji", descKey: "index.cards.kanjiDesc", Icon: Layers, tone: "orange", glyph: "学" },
  { to: "/vocabulary", eyebrow: "03 / DAILY WORDS", titleKey: "index.cards.vocabulary", descKey: "index.cards.vocabularyDesc", Icon: BookMarked, tone: "blue", glyph: "言" },
  { to: "/canvas", eyebrow: "04 / HANDWRITING", titleKey: "index.cards.canvas", descKey: "index.cards.canvasDesc", Icon: Brush, tone: "pink", glyph: "書" },
  { to: "/grammar", eyebrow: "05 / SENTENCE LAB", titleKey: "index.cards.grammar", descKey: "index.cards.grammarDesc", Icon: Sparkles, tone: "violet", glyph: "文" },
] as const;

type ProgressSegmentState = "mastered" | "started" | "left";

const getSegmentState = (item?: ProgressItem): ProgressSegmentState => {
  if (!item || item.correct + item.incorrect === 0) return "left";
  return item.masteryScore >= 85 ? "mastered" : "started";
};

const kanaCatalog = (data: typeof hiraganaData) => data.filter((item) => !item.isEmpty).map((item) => item.char);

export const Index: React.FC = () => {
  const { t } = useTranslation();
  const aggregates = useMemo(() => getAggregates(), []);
  const progressSnapshot = useProgressSnapshot();
  const recommendations = useMemo(() => getTrainingRecommendations(), [progressSnapshot.updatedAt]);
  const mastered = useMemo(() => getMasteredKana(), []);
  const totalAnswered = aggregates.totalCorrect + aggregates.totalWrong;
  const unifiedTotals = useMemo(() => Object.values(progressSnapshot.sessions).reduce((total, session) => ({ correct: total.correct + session.correct, incorrect: total.incorrect + session.incorrect }), { correct: 0, incorrect: 0 }), [progressSnapshot.sessions]);
  const trackedAnswered = unifiedTotals.correct + unifiedTotals.incorrect || totalAnswered;
  const trackedAccuracy = trackedAnswered ? Math.round((unifiedTotals.correct / trackedAnswered) * 100) : aggregates.globalAccuracy;
  const trackedSessions = Object.keys(progressSnapshot.sessions).length || aggregates.totalQuizzes;
  const weeklyGoal = Math.min(100, Math.round((trackedSessions / 7) * 100));
  const progressRows = useMemo(() => {
    const items = Object.values(progressSnapshot.items);
    const progressMap = new Map(items.map((item) => [`${item.domain}:${item.itemId}`, item]));
    const buildKanaRow = (label: string, ids: string[]) => {
      const segments = ids.map((id) => getSegmentState(progressMap.get(`kana:${id}`)));
      return { label, segments };
    };
    const kanjiItems = items.filter((item) => item.domain === "kanji");
    const kanjiSegments: ProgressSegmentState[] = [
      ...kanjiItems.map(getSegmentState),
      ...Array<ProgressSegmentState>(Math.max(0, totalKanjiCount - kanjiItems.length)).fill("left"),
    ].slice(0, totalKanjiCount);
    return [
      buildKanaRow("Hiragana", kanaCatalog(hiraganaData)),
      buildKanaRow("Katakana", kanaCatalog(katakanaData)),
      { label: "Kanji", segments: kanjiSegments },
    ];
  }, [progressSnapshot.items]);

  return (
    <AppShell title="Overview" className="index-container app-dashboard">
      <div className="dashboard-content">
        <section className="dashboard-hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT SESSION</div>
            <h1>Build your<br /><em>Japanese</em> rhythm.</h1>
            <p>{t("index.subtitle")}. A focused space for the characters, words, and patterns you want to keep.</p>
            <div className="hero-actions"><Link to="/practice" className="hero-cta">{t("index.cards.practice")} <ArrowUpRight size={17} /></Link><Link to="/stats" className="hero-secondary">{t("common.stats")} <ChevronRight size={16} /></Link></div>
          </div>
          <div className="hero-visual" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><span className="hero-kana hero-kana-main">あ</span><span className="hero-kana hero-kana-small kana-a">か</span><span className="hero-kana hero-kana-small kana-b">学</span><span className="hero-kana hero-kana-small kana-c">の</span><div className="hero-stamp">毎日<br /><span>まいにち</span></div></div>
        </section>

        <section className="metric-row" aria-label="Learning summary">
          <div className="metric-card metric-highlight"><div className="metric-icon"><Target size={17} /></div><div><span className="metric-label">ACCURACY</span><strong>{trackedAccuracy}%</strong></div><span className="metric-trend">{trackedAnswered ? `${trackedAnswered} answers` : "Start today"}</span></div>
          <div className="metric-card"><div className="metric-icon"><Trophy size={17} /></div><div><span className="metric-label">MASTERED</span><strong>{mastered.length}</strong></div><span className="metric-trend">kana</span></div>
          <div className="metric-card"><div className="metric-icon"><BarChart3 size={17} /></div><div><span className="metric-label">SESSIONS</span><strong>{trackedSessions}</strong></div><span className="metric-trend">all time</span></div>
          <div className="goal-card"><div className="goal-top"><span className="metric-label">WEEKLY RHYTHM</span><strong>{weeklyGoal}%</strong></div><div className="goal-track"><span style={{ width: `${weeklyGoal}%` }} /></div><span className="goal-caption">{trackedSessions ? "Keep the momentum going" : "One session is a great start"}</span></div>
        </section>

        <section className="session-section">
          <div className="section-heading"><div><span className="section-kicker">EXPLORE THE STUDIO</span><h2>Pick a direction.</h2></div><span className="section-count">{sessions.length.toString().padStart(2, "0")} tools</span></div>
          <div className="session-grid">{sessions.map(({ to, eyebrow, titleKey, descKey, Icon, tone, glyph }) => <Link key={to} to={to} className={`session-card tone-${tone}`}><div className="session-card-top"><span>{eyebrow}</span><Icon size={18} strokeWidth={1.7} /></div><div className="session-glyph">{glyph}</div><div className="session-card-bottom"><div><h3>{t(titleKey)}</h3><p>{t(descKey)}</p></div><span className="round-arrow"><ArrowUpRight size={17} /></span></div></Link>)}</div>
        </section>

        <section className="bottom-grid">
          <Link to="/stats" className="progress-panel"><div className="panel-heading"><div><span className="section-kicker">KEEP GOING</span><h2>Your progress</h2></div><ArrowUpRight size={18} /></div><div className="progress-bars">{progressRows.map(({ label, segments }) => { const masteredCount = segments.filter((state) => state === "mastered").length; return <div className="progress-item" key={label}><div><span>{label}</span><strong>{masteredCount}/{segments.length}</strong></div><div className={`progress-track progress-track-segmented ${segments.length > 200 ? "is-dense" : ""}`} aria-label={`${label}: ${masteredCount} mastered of ${segments.length}`}>{segments.map((state, index) => <span className={`progress-segment is-${state}`} key={`${label}-${index}`} aria-hidden="true" />)}</div></div>; })}</div></Link>
          <Link to="/numbers" className="number-panel"><div className="number-panel-copy"><span className="section-kicker">NEW ROUTE</span><h2>Make numbers<br /><em>second nature.</em></h2><span className="text-link">Try numbers <ChevronRight size={15} /></span></div><div className="number-decoration" aria-hidden="true"><span>一</span><span>二</span><span>三</span></div></Link>
        </section>
        {recommendations[0] && <Link to={recommendations[0].actionPath} className="dashboard-recommendation"><div><span className="section-kicker">NEXT BEST SESSION</span><h2>{t(recommendations[0].titleKey)}</h2><p>{t(recommendations[0].descriptionKey)}</p></div><span className="dashboard-recommendation-arrow">↗</span></Link>}
      </div>
    </AppShell>
  );
};
