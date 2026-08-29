import { lazy, Suspense, type ComponentType } from "react";
import { BookOpen, CheckCircle2 as LucideCheckCircle2, ChevronRight, LockKeyhole, Sparkles } from "lucide-react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppShell } from "../components/ui/AppShell";
import { PrefetchLink } from "../components/ui/PrefetchLink";
import { RouteSkeleton } from "../components/ui/RouteSkeleton";
import { getGrammarLessonDescriptor, getLegacyGrammarRedirect, grammarTrackDescriptors, localizedDescriptor } from "../data/grammarCatalog";
import type { GrammarLocale } from "../data/grammar";
import { useProgressSnapshot } from "../utils/progressRepository";
import { isGrammarPartCompleted } from "../utils/grammarCompletion";
import "./Grammar.css";

const CheckCircle2 = LucideCheckCircle2 as unknown as ComponentType<Record<string, unknown>>;

const GrammarLessonRoute = lazy(() => import("./GrammarLessonRoute").then((module) => ({ default: module.GrammarLessonRoute })));
const localeFor = (language: string): GrammarLocale => language.toLowerCase().startsWith("es") ? "es" : "en";
const lessonLabel = (lessonNumber: number | undefined, t: ReturnType<typeof useTranslation>["t"]) => t("grammar.lesson", { number: lessonNumber });

export const Grammar = () => {
  const { t, i18n } = useTranslation();
  const progress = useProgressSnapshot();
  const { trackId, lessonId } = useParams();
  const location = useLocation();
  const locale = localeFor(i18n.language);
  const legacyRedirect = trackId === "genki" && lessonId ? getLegacyGrammarRedirect(lessonId, location.search) : undefined;

  if (legacyRedirect) return <Navigate to={legacyRedirect} replace />;
  if (trackId && lessonId) {
    if (!getGrammarLessonDescriptor(trackId, lessonId)) return <GrammarNotFound />;
    return <Suspense fallback={<RouteSkeleton />}><GrammarLessonRoute trackId={trackId} lessonId={lessonId} /></Suspense>;
  }

  return <AppShell title={t("grammar.title")}><div className="grammar-page"><header className="grammar-hero"><div className="grammar-hero-copy"><span className="eyebrow"><span className="eyebrow-line" />{t("grammar.kicker")}</span><h1>{t("grammar.heading")}</h1><p>{t("grammar.subtitle")}</p></div><div className="grammar-hero-mark" aria-hidden="true"><span>文</span><i>文法</i></div></header><section className="grammar-track-grid" aria-label={t("grammar.categoriesLabel")}>{grammarTrackDescriptors.map((track, index) => { const available = track.lessons.length > 0; return <article className={`grammar-track-card ${available ? "is-available" : "is-coming"}`} key={track.id}><div className="grammar-track-card-top"><span>0{index + 1} / {t("grammar.trackLabel")}</span>{available ? <BookOpen size={19} /> : <LockKeyhole size={18} />}</div><div className="grammar-track-glyph" aria-hidden="true">{track.id === "foundations" ? "基" : "続"}</div><h2>{localizedDescriptor(track.title, locale)}</h2><p>{localizedDescriptor(track.description, locale)}</p>{available ? <div className="grammar-lesson-list">{track.lessons.map((lesson) => { const completed = lesson.parts.length > 0 && lesson.parts.every((part) => isGrammarPartCompleted(progress, track.id, lesson.id, part.id)); return <PrefetchLink className={`grammar-lesson-row ${completed ? "is-completed" : ""}`} to={`/grammar/${track.id}/${lesson.id}`} key={lesson.id}><span><small>{lessonLabel(lesson.lessonNumber, t)}</small><strong>{localizedDescriptor(lesson.title, locale)}</strong></span>{completed ? <CheckCircle2 size={17} aria-label={t("grammar.completed")} title={t("grammar.completed")} /> : <ChevronRight size={17} />}</PrefetchLink>; })}</div> : <div className="grammar-coming-soon"><Sparkles size={16} /><span>{t("grammar.comingSoon")}</span></div>}{track.compatibilityNote && <p className="grammar-compatibility-note">{localizedDescriptor(track.compatibilityNote, locale)}</p>}</article>; })}</section></div></AppShell>;
};

const GrammarNotFound = () => { const { t } = useTranslation(); return <AppShell title={t("grammar.title")} backTo="/grammar" backLabel={t("grammar.backToGrammar")}><div className="grammar-empty-state glass-panel"><span className="grammar-empty-mark">?</span><h1>{t("grammar.notFoundTitle")}</h1><p>{t("grammar.notFoundDescription")}</p><PrefetchLink className="btn-primary" to="/grammar">{t("grammar.backToGrammar")}</PrefetchLink></div></AppShell>; };
