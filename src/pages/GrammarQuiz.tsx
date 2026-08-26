import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuizWorkspace } from "../components/quiz/QuizWorkspace";
import { getGrammarLesson, getGrammarTrack, getLegacyGrammarRedirect, type GrammarExercise, type GrammarExerciseSetId, type GrammarLocale } from "../data/grammar";
import { recordCompletedSession, recordItemResults } from "../utils/progressRepository";
import "./GrammarQuiz.css";

const localeFor = (language: string): GrammarLocale => language.toLowerCase().startsWith("es") ? "es" : "en";

const shuffle = <T,>(values: readonly T[]): T[] => {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const buildDeck = (pool: readonly GrammarExercise[]): GrammarExercise[] =>
  shuffle(pool).map((question) => ({ ...question, options: shuffle(question.options) }));

export const GrammarQuiz = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { trackId = "", lessonId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const locale = localeFor(i18n.language);
  const lesson = getGrammarLesson(trackId, lessonId);
  const track = getGrammarTrack(trackId);
  const legacyRedirect = trackId === "genki" ? getLegacyGrammarRedirect(lessonId, location.search, true) : undefined;
  const requestedPartId = searchParams.get("part");
  const activePart = lesson?.parts.find((part) => part.id === requestedPartId) ?? lesson?.parts[0];
  const requestedSets = searchParams.get("sets") ?? "";
  const selectedSetIds = useMemo(() => {
    const validIds = new Set<GrammarExerciseSetId>(activePart?.exerciseSets.map((set) => set.id));
    const normalized = requestedSets.split(",").flatMap((id) => id === "wa-desu" ? ["wa", "desu"] : [id]);
    const requested = normalized.filter((id): id is GrammarExerciseSetId => validIds.has(id as GrammarExerciseSetId));
    const uniqueRequested = [...new Set(requested)];
    return uniqueRequested.length ? uniqueRequested : (activePart?.exerciseSets.map((set) => set.id) ?? []);
  }, [activePart, requestedSets]);
  const pool = useMemo(() => activePart?.exercises.filter((item) => selectedSetIds.includes(item.setId)) ?? [], [activePart, selectedSetIds]);
  const deckSourceKey = `${activePart?.id ?? ""}:${selectedSetIds.join(",")}`;
  const deckSourceKeyRef = useRef(deckSourceKey);
  const [deck, setDeck] = useState<GrammarExercise[]>(() => buildDeck(pool));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const answerResultsRef = useRef<Array<{ itemId: string; correct: boolean }>>([]);
  const sessionIdRef = useRef(`grammar-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const sessionStartedAtRef = useRef(Date.now());
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const currentQuestion = deck[questionIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = currentQuestion && selectedAnswer ? selectedAnswer === currentQuestion.answer : null;
  const questionInstruction = currentQuestion?.instruction?.[locale] ?? t("grammar.chooseParticle");

  useEffect(() => {
    if (!lesson && !legacyRedirect) navigate("/grammar", { replace: true });
  }, [legacyRedirect, lesson, navigate]);

  useEffect(() => {
    if (isAnswered) nextButtonRef.current?.focus();
  }, [isAnswered]);

  useEffect(() => {
    if (deckSourceKeyRef.current === deckSourceKey) return;
    deckSourceKeyRef.current = deckSourceKey;
    answerResultsRef.current = [];
    sessionIdRef.current = `grammar-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStartedAtRef.current = Date.now();
    setDeck(buildDeck(pool));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  }, [deckSourceKey, pool]);

  if (legacyRedirect) return <Navigate to={legacyRedirect} replace />;
  if (!lesson || !track || !activePart) return null;

  const finish = () => {
    recordItemResults("grammar", answerResultsRef.current);
    recordCompletedSession({ id: sessionIdRef.current, domain: "grammar", mode: "multiple-choice", source: `/grammar/${track.id}/${lesson.id}?part=${activePart.id}`, startedAt: sessionStartedAtRef.current, total: deck.length, correct: score });
    setFinished(true);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered || !currentQuestion) return;
    const correct = answer === currentQuestion.answer;
    setSelectedAnswer(answer);
    answerResultsRef.current.push({ itemId: currentQuestion.id, correct });
    if (correct) setScore((value) => value + 1);
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    if (questionIndex >= deck.length - 1) {
      finish();
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    answerResultsRef.current = [];
    sessionIdRef.current = `grammar-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStartedAtRef.current = Date.now();
    setDeck(buildDeck(pool));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  const title = `${track.title[locale]} · ${lesson.title[locale]}`;
  const lessonPath = `/grammar/${track.id}/${lesson.id}?part=${encodeURIComponent(activePart.id)}`;
  const selectedSetLabels = activePart.exerciseSets.filter((set) => selectedSetIds.includes(set.id)).map((set) => set.label[locale]);

  if (!deck.length) {
    return <QuizWorkspace title={title} sourceLabel={t("grammar.quizKicker")} sourceDetail={activePart.title[locale]} total={0} questionIndex={0} score={0} attempts={0} backTo={lessonPath} backLabel={t("grammar.backToLesson")}><div className="grammar-quiz-empty glass-panel"><h1>{t("grammar.noExercises")}</h1><Link className="btn-primary" to={lessonPath}>{t("grammar.backToLesson")}</Link></div></QuizWorkspace>;
  }

  if (finished) {
    const accuracy = Math.round((score / deck.length) * 100);
    return <QuizWorkspace title={title} sourceLabel={t("grammar.quizKicker")} sourceDetail={activePart.title[locale]} total={deck.length} questionIndex={deck.length} score={score} attempts={deck.length} backTo={lessonPath} backLabel={t("grammar.backToLesson")}><div className="grammar-quiz-result glass-panel"><span className="grammar-result-mark">文</span><span className="grammar-panel-kicker">{t("grammar.quizKicker")}</span><h1>{t("grammar.resultsTitle")}</h1><div className="grammar-result-score">{score}<span>/ {deck.length}</span></div><p>{t("grammar.resultsAccuracy", { percent: accuracy })}</p><div className="grammar-result-actions"><button className="btn-primary" type="button" onClick={restart}><RotateCcw size={16} />{t("grammar.tryAgain")}</button><Link className="btn-secondary" to={lessonPath}>{t("grammar.backToLesson")}<ArrowRight size={16} /></Link></div></div></QuizWorkspace>;
  }

  return <QuizWorkspace title={title} sourceLabel={t("grammar.quizKicker")} sourceDetail={`${activePart.title[locale]} · ${activePart.description[locale]}`} total={deck.length} questionIndex={questionIndex} score={score} attempts={questionIndex + (isAnswered ? 1 : 0)} remaining={Math.max(deck.length - questionIndex - (isAnswered ? 1 : 0), 0)} backTo={lessonPath} backLabel={t("grammar.quitQuiz")} railContent={<><span className="quiz-rail-context-label">{t("grammar.selectedSets")}</span><div className="quiz-rail-context-list">{selectedSetLabels.map((label) => <span key={label}>{label}</span>)}</div></>}>
    <div className="grammar-quiz-container">
      <div className="grammar-quiz-meta"><span>{t("grammar.question", { current: questionIndex + 1, total: deck.length })}</span><span className={`grammar-difficulty is-${currentQuestion.difficulty}`}>{t(`grammar.difficulty.${currentQuestion.difficulty}`)}</span><span>{t("grammar.questionsRemaining", { count: deck.length - questionIndex - 1 })}</span></div>
      <article className={`grammar-question-card glass-panel ${isCorrect === true ? "is-correct" : isCorrect === false ? "is-incorrect" : ""}`}>
        <div className="grammar-question-label">{questionInstruction}</div>
        <p className="grammar-question-sentence" lang={/[\u3040-\u30ff\u3400-\u9fff]/.test(currentQuestion.sentence) ? "ja" : undefined}>{currentQuestion.promptKind === "choice" ? currentQuestion.sentence : currentQuestion.sentence.split("___").map((part, index, parts) => <span key={`${part}-${index}`}>{part}{index < parts.length - 1 && <strong className="grammar-blank">?</strong>}</span>)}</p>
        <p className="grammar-question-translation">{currentQuestion.translation[locale]}</p>
        <div className="grammar-answer-grid" role="group" aria-label={questionInstruction}>
          {currentQuestion.options.map((option) => { const correct = isAnswered && option === currentQuestion.answer; const incorrect = isAnswered && option === selectedAnswer && option !== currentQuestion.answer; return <button type="button" key={option} className={`grammar-answer-option ${correct ? "is-correct" : ""} ${incorrect ? "is-incorrect" : ""}`} onClick={() => handleAnswer(option)} disabled={isAnswered} aria-pressed={selectedAnswer === option}>{correct ? <CheckCircle2 size={17} /> : incorrect ? <XCircle size={17} /> : <span className="grammar-option-dot" />}<span>{option}</span></button>; })}
        </div>
        <div className="grammar-quiz-feedback" role="status" aria-live="polite">{isAnswered && <><strong>{isCorrect ? t("grammar.correct") : t("grammar.incorrect")}</strong><span>{currentQuestion.explanation[locale]}</span>{!isCorrect && <em>{t("grammar.correctAnswer", { answer: currentQuestion.answer })}</em>}</>}</div>
        <button className="btn-primary grammar-next-button" type="button" ref={nextButtonRef} onClick={handleNext} disabled={!isAnswered}>{questionIndex === deck.length - 1 ? t("grammar.finish") : t("grammar.next")}<ArrowRight size={16} /></button>
      </article>
    </div>
  </QuizWorkspace>;
};
