import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Check, ChevronRight, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppShell } from "../components/ui/AppShell";
import { getGrammarLesson, getGrammarLessonExerciseCount, getGrammarTrack, getLegacyGrammarRedirect, grammarTracks, type GrammarLocale } from "../data/grammar";
import { hiraganaData } from "../data/hiragana";
import { katakanaData } from "../data/katakana";
import "./Grammar.css";

const grammarSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [["className", /^grammar-example$/]],
    span: [["className", /^grammar-(topic|particle|about|verb|key)$/]],
  },
};

const localeFor = (language: string): GrammarLocale => language.toLowerCase().startsWith("es") ? "es" : "en";

const localized = <T extends { en: string; es: string }>(value: T, locale: GrammarLocale) => value[locale];
const lessonLabel = (kind: "introduction" | "numbered", lessonNumber: number | undefined, t: ReturnType<typeof useTranslation>["t"]) =>
  kind === "introduction" ? t("grammar.introduction") : t("grammar.lesson", { number: lessonNumber });

export const Grammar = () => {
  const { t, i18n } = useTranslation();
  const { trackId, lessonId } = useParams();
  const location = useLocation();
  const locale = localeFor(i18n.language);
  const lesson = trackId && lessonId ? getGrammarLesson(trackId, lessonId) : undefined;
  const legacyRedirect = trackId === "genki" && lessonId ? getLegacyGrammarRedirect(lessonId, location.search) : undefined;

  if (legacyRedirect) return <Navigate to={legacyRedirect} replace />;

  if (trackId && lessonId) {
    return lesson ? <GrammarLessonPage lesson={lesson} locale={locale} /> : <GrammarNotFound />;
  }

  return (
    <AppShell title={t("grammar.title")}>
      <div className="grammar-page">
        <header className="grammar-hero">
          <div className="grammar-hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" />{t("grammar.kicker")}</span>
            <h1>{t("grammar.heading")}</h1>
            <p>{t("grammar.subtitle")}</p>
          </div>
          <div className="grammar-hero-mark" aria-hidden="true"><span>文</span><i>文法</i></div>
        </header>

        <section className="grammar-track-grid" aria-label={t("grammar.categoriesLabel")}>
          {grammarTracks.map((track, index) => {
            const available = track.lessons.length > 0;
            return (
              <article className={`grammar-track-card ${available ? "is-available" : "is-coming"}`} key={track.id}>
                <div className="grammar-track-card-top"><span>0{index + 1} / {t("grammar.trackLabel")}</span>{available ? <BookOpen size={19} /> : <LockKeyhole size={18} />}</div>
                <div className="grammar-track-glyph" aria-hidden="true">{track.id === "foundations" ? "基" : "続"}</div>
                <h2>{localized(track.title, locale)}</h2>
                <p>{localized(track.description, locale)}</p>
                {available ? (
                  <div className="grammar-lesson-list">
                    {track.lessons.map((lessonItem) => <Link className="grammar-lesson-row" to={`/grammar/${track.id}/${lessonItem.id}`} key={lessonItem.id}><span><small>{lessonLabel(lessonItem.kind, lessonItem.lessonNumber, t)}</small><strong>{localized(lessonItem.title, locale)}</strong></span><ChevronRight size={17} /></Link>)}
                  </div>
                ) : <div className="grammar-coming-soon"><Sparkles size={16} /><span>{t("grammar.comingSoon")}</span></div>}
                {track.compatibilityNote && <p className="grammar-compatibility-note">{localized(track.compatibilityNote, locale)}</p>}
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
};

interface GrammarLessonPageProps {
  lesson: NonNullable<ReturnType<typeof getGrammarLesson>>;
  locale: GrammarLocale;
}

const GrammarLessonPage = ({ lesson, locale }: GrammarLessonPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const firstPart = lesson.parts[0];
  const requestedPartId = searchParams.get("part");
  const activePart = lesson.parts.find((part) => part.id === requestedPartId) ?? firstPart;
  const [selectedSetsByPart, setSelectedSetsByPart] = useState<Record<string, string[]>>(() => Object.fromEntries(
    lesson.parts.map((part) => [part.id, part.exerciseSets[0]?.id ? [part.exerciseSets[0].id] : []]),
  ));
  const selectedSets = selectedSetsByPart[activePart.id] ?? [];
  const selectedQuestionCount = useMemo(() => activePart.exercises.filter((exercise) => selectedSets.includes(exercise.setId)).length, [activePart.exercises, selectedSets]);

  useEffect(() => {
    if (requestedPartId !== activePart.id) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("part", activePart.id);
      setSearchParams(nextParams, { replace: true });
    }
  }, [activePart.id, requestedPartId, searchParams, setSearchParams]);

  const toggleSet = (setId: string) => {
    setSelectedSetsByPart((current) => {
      const currentSets = current[activePart.id] ?? [];
      const nextSets = currentSets.includes(setId) ? currentSets.filter((id) => id !== setId) : [...currentSets, setId];
      return { ...current, [activePart.id]: nextSets };
    });
  };

  const startExercises = () => {
    if (!selectedSets.length) return;
    const query = new URLSearchParams({ part: activePart.id, sets: selectedSets.join(",") });
    navigate(`/grammar/${lesson.track}/${lesson.id}/practice?${query.toString()}`);
  };

  return (
    <AppShell title={localized(lesson.title, locale)} backTo="/grammar" backLabel={t("grammar.backToGrammar")}>
      <div className="grammar-lesson-page">
        <header className="grammar-lesson-hero">
          <div>
            <span className="eyebrow"><span className="eyebrow-line" />{localized(getGrammarTrack(lesson.track)!.title, locale)} · {lessonLabel(lesson.kind, lesson.lessonNumber, t)}</span>
            <h1>{localized(lesson.title, locale)}</h1>
            <p>{localized(lesson.summary, locale)}</p>
          </div>
          <div className="grammar-lesson-meta"><Clock3 size={16} /><span>{t("grammar.exerciseCount", { count: getGrammarLessonExerciseCount(lesson) })}</span></div>
        </header>

        <div className="grammar-lesson-layout">
          <main className="grammar-lesson-main">
            <article className="grammar-markdown glass-panel" aria-label={localized(activePart.title, locale)}>
              <div className="grammar-part-banner"><span>{t("grammar.partLabel", { number: lesson.parts.indexOf(activePart) + 1 })}</span><small>{localized(activePart.description, locale)}</small></div>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, grammarSchema]]}>
                {activePart.content[locale]}
              </ReactMarkdown>
            </article>

            {activePart.reference && <GrammarKanaReference script={activePart.reference} />}

            {activePart.relatedPractice && (
              <Link className="grammar-related-practice glass-panel" to={activePart.relatedPractice.to}>
                <span><strong>{localized(activePart.relatedPractice.label, locale)}</strong><small>{localized(activePart.relatedPractice.description, locale)}</small></span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            )}

            <aside className="grammar-exercise-panel glass-panel" aria-labelledby="grammar-exercise-heading">
              <div className="grammar-panel-kicker">{t("grammar.practiceKicker")}</div>
              <h2 id="grammar-exercise-heading">{t("grammar.chooseSets")}</h2>
              <p>{t("grammar.chooseSetsDescription")}</p>
              <div className="grammar-set-list">
                {activePart.exerciseSets.map((set) => {
                  const checked = selectedSets.includes(set.id);
                  const count = activePart.exercises.filter((exercise) => exercise.setId === set.id).length;
                  return <label className={`grammar-set-option ${checked ? "is-selected" : ""}`} key={set.id}><input type="checkbox" checked={checked} onChange={() => toggleSet(set.id)} /><span className="grammar-set-check">{checked && <Check size={14} />}</span><span className="grammar-set-copy"><strong>{localized(set.label, locale)}</strong><small>{localized(set.description, locale)}</small></span><em>{count}</em></label>;
                })}
              </div>
              <div className="grammar-start-row"><span>{t("grammar.selectedQuestions", { count: selectedQuestionCount })}</span><button className="btn-primary" type="button" onClick={startExercises} disabled={!selectedSets.length}>{t("grammar.startExercises")}<ChevronRight size={16} /></button></div>
            </aside>
          </main>

          <aside className="grammar-parts-panel glass-panel" aria-labelledby="grammar-parts-heading">
            <div className="grammar-panel-kicker">{t("grammar.partsKicker")}</div>
            <h2 id="grammar-parts-heading">{t("grammar.partsIndex")}</h2>
            <nav className="grammar-parts-list" aria-label={t("grammar.partsIndex")}>
              {lesson.parts.map((part, index) => <button className={`grammar-part-row ${part.id === activePart.id ? "is-active" : ""}`} type="button" key={part.id} onClick={() => { const nextParams = new URLSearchParams(searchParams); nextParams.set("part", part.id); setSearchParams(nextParams, { replace: true }); }} aria-current={part.id === activePart.id ? "page" : undefined}><span className="grammar-part-number">{String(index + 1).padStart(2, "0")}</span><span className="grammar-part-copy"><strong>{localized(part.title, locale)}</strong><small>{localized(part.description, locale)}</small></span><em>{t("grammar.partQuestions", { count: part.exercises.length })}</em></button>)}
            </nav>
          </aside>
        </div>
      </div>
    </AppShell>
  );
};

const GrammarKanaReference = ({ script }: { script: "hiragana" | "katakana" }) => {
  const { t } = useTranslation();
  const kana = script === "hiragana" ? hiraganaData : katakanaData;
  const rows = Array.from({ length: Math.ceil(kana.length / 5) }, (_, index) => kana.slice(index * 5, index * 5 + 5));
  const scriptName = script === "hiragana" ? "Hiragana" : "Katakana";
  return (
    <section className="grammar-kana-reference glass-panel" aria-labelledby={`${script}-reference-heading`}>
      <div className="grammar-panel-kicker">{t("grammar.referenceKicker")}</div>
      <h2 id={`${script}-reference-heading`}>{t("grammar.kanaReference", { script: scriptName })}</h2>
      <div className="grammar-kana-table-wrap">
        <table>
          <caption className="sr-only">{t("grammar.kanaReferenceDescription", { script: scriptName })}</caption>
          <thead><tr><th scope="col">#</th>{[1, 2, 3, 4, 5].map((position) => <th scope="col" key={position}>{t("grammar.kanaColumn", { position })}</th>)}</tr></thead>
          <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}><th scope="row">{rowIndex + 1}</th>{row.map((item, columnIndex) => <td className={item.isEmpty ? "is-empty" : undefined} key={`${rowIndex}-${columnIndex}`} aria-hidden={item.isEmpty || undefined} aria-label={item.isEmpty ? undefined : `${item.char}, ${item.romaji}`}>{item.isEmpty ? null : <><span lang="ja">{item.char}</span><small>{item.romaji}</small></>}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
};

const GrammarNotFound = () => {
  const { t } = useTranslation();
  return <AppShell title={t("grammar.title")} backTo="/grammar" backLabel={t("grammar.backToGrammar")}><div className="grammar-empty-state glass-panel"><span className="grammar-empty-mark">?</span><h1>{t("grammar.notFoundTitle")}</h1><p>{t("grammar.notFoundDescription")}</p><Link className="btn-primary" to="/grammar">{t("grammar.backToGrammar")}</Link></div></AppShell>;
};
