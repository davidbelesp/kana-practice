import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, BarChart3, BookMarked, BookOpen, Brush, ChevronRight, Layers, Target, Trophy } from "lucide-react";
import { getAggregates, getMasteredKana } from "../utils/statsManager";
import { AppShell } from "../components/ui/AppShell";
import "./Index.css";

const sessions = [
  { to: "/practice", eyebrow: "01 / FOUNDATIONS", titleKey: "index.cards.practice", descKey: "index.cards.practiceDesc", Icon: BookOpen, tone: "lime", glyph: "あ" },
  { to: "/kanji", eyebrow: "02 / JLPT PATH", titleKey: "index.cards.kanji", descKey: "index.cards.kanjiDesc", Icon: Layers, tone: "orange", glyph: "学" },
  { to: "/vocabulary", eyebrow: "03 / DAILY WORDS", titleKey: "index.cards.vocabulary", descKey: "index.cards.vocabularyDesc", Icon: BookMarked, tone: "blue", glyph: "言" },
  { to: "/canvas", eyebrow: "04 / HANDWRITING", titleKey: "index.cards.canvas", descKey: "index.cards.canvasDesc", Icon: Brush, tone: "pink", glyph: "書" },
] as const;

export const Index: React.FC = () => {
  const { t } = useTranslation();
  const aggregates = useMemo(() => getAggregates(), []);
  const mastered = useMemo(() => getMasteredKana(), []);
  const totalAnswered = aggregates.totalCorrect + aggregates.totalWrong;
  const weeklyGoal = Math.min(100, Math.round((aggregates.totalQuizzes / 7) * 100));

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
          <div className="metric-card metric-highlight"><div className="metric-icon"><Target size={17} /></div><div><span className="metric-label">ACCURACY</span><strong>{aggregates.globalAccuracy}%</strong></div><span className="metric-trend">{totalAnswered ? `${totalAnswered} answers` : "Start today"}</span></div>
          <div className="metric-card"><div className="metric-icon"><Trophy size={17} /></div><div><span className="metric-label">MASTERED</span><strong>{mastered.length}</strong></div><span className="metric-trend">kana</span></div>
          <div className="metric-card"><div className="metric-icon"><BarChart3 size={17} /></div><div><span className="metric-label">SESSIONS</span><strong>{aggregates.totalQuizzes}</strong></div><span className="metric-trend">all time</span></div>
          <div className="goal-card"><div className="goal-top"><span className="metric-label">WEEKLY RHYTHM</span><strong>{weeklyGoal}%</strong></div><div className="goal-track"><span style={{ width: `${weeklyGoal}%` }} /></div><span className="goal-caption">{aggregates.totalQuizzes ? "Keep the momentum going" : "One session is a great start"}</span></div>
        </section>

        <section className="session-section">
          <div className="section-heading"><div><span className="section-kicker">EXPLORE THE STUDIO</span><h2>Pick a direction.</h2></div><span className="section-count">{sessions.length.toString().padStart(2, "0")} tools</span></div>
          <div className="session-grid">{sessions.map(({ to, eyebrow, titleKey, descKey, Icon, tone, glyph }) => <Link key={to} to={to} className={`session-card tone-${tone}`}><div className="session-card-top"><span>{eyebrow}</span><Icon size={18} strokeWidth={1.7} /></div><div className="session-glyph">{glyph}</div><div className="session-card-bottom"><div><h3>{t(titleKey)}</h3><p>{t(descKey)}</p></div><span className="round-arrow"><ArrowUpRight size={17} /></span></div></Link>)}</div>
        </section>

        <section className="bottom-grid">
          <Link to="/stats" className="progress-panel"><div className="panel-heading"><div><span className="section-kicker">KEEP GOING</span><h2>Your progress</h2></div><ArrowUpRight size={18} /></div><div className="progress-bars">{["Hiragana", "Katakana", "Kanji"].map((label, index) => { const values = [Math.min(100, mastered.length * 5), Math.min(100, Math.max(8, aggregates.globalAccuracy)), Math.min(100, mastered.length * 2)]; return <div className="progress-item" key={label}><div><span>{label}</span><strong>{values[index]}%</strong></div><div className="progress-track"><span style={{ width: `${values[index]}%` }} /></div></div>; })}</div></Link>
          <Link to="/numbers" className="number-panel"><div className="number-panel-copy"><span className="section-kicker">NEW ROUTE</span><h2>Make numbers<br /><em>second nature.</em></h2><span className="text-link">Try numbers <ChevronRight size={15} /></span></div><div className="number-decoration" aria-hidden="true"><span>一</span><span>二</span><span>三</span></div></Link>
        </section>
      </div>
    </AppShell>
  );
};
