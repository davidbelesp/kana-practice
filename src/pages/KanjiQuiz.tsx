import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuizCard } from "../components/QuizCard";
import { QuizWorkspace } from "../components/quiz/QuizWorkspace";
import { useQuizSession } from "../components/quiz/useQuizSession";
import { kanjiLevels } from "../data/kanjiManifest";
import type { KanjiChar } from "../data/kanjiTypes";
import { generateKanjiQuizDeck } from "../utils/kanjiQuestionGenerator";
import { saveStatResultsBatch, saveQuizHistory } from "../utils/statsManager";
import { type QuizQuestion } from "../types/QuizTypes";
import { useSettings } from "../contexts/SettingsContext";
import "./Quiz.css";

interface QuizState { selectedChars: string[]; }

export const KanjiQuiz = () => {
  const { t } = useTranslation(["translation", "kanji_meanings"]);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizState | null;
  const { settings } = useSettings();
  const selectedChars = state?.selectedChars ?? [];
  const pendingStatsRef = useRef<Array<{ char: string; isCorrect: boolean }>>([]);
  const [pool, setPool] = useState<KanjiChar[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [userAnswer, setUserAnswer] = useState<string | string[]>("");

  const selectedSet = useMemo(() => new Set(selectedChars), [selectedChars]);
  const neededLevels = useMemo(() => kanjiLevels.filter((descriptor) => descriptor.characters.some((character) => selectedSet.has(character))), [selectedSet]);
  const translateKanji = useCallback((kanji: KanjiChar) => t(`kanji_meanings:${kanji.char}`, { defaultValue: kanji.meaning }), [t]);
  const total = Math.min(settings.questionsPerQuiz, pool.length, 60);

  useEffect(() => {
    if (!state?.selectedChars?.length) {
      navigate("/kanji", { replace: true });
      return;
    }
    let active = true;
    setLoadState("loading");
    Promise.all(neededLevels.map((descriptor) => descriptor.load()))
      .then((levels) => {
        if (!active) return;
        const loaded = levels.flat().filter((kanji) => selectedSet.has(kanji.char));
        setPool(loaded);
        const first = generateKanjiQuizDeck(loaded, 1, translateKanji, settings.enabledQuestionTypes)[0];
        setDeck(first ? [first] : []);
        setLoadState(loaded.length > 0 ? "ready" : "error");
      })
      .catch(() => { if (active) setLoadState("error"); });
    return () => { active = false; };
  }, [navigate, neededLevels, selectedSet, settings.enabledQuestionTypes, state?.selectedChars?.length, translateKanji]);

  const buildQuestion = useCallback((previous: QuizQuestion[]) => {
    const used = new Set(previous.map((question) => question.prompt));
    let fallback: QuizQuestion | undefined;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const question = generateKanjiQuizDeck(pool, 1, translateKanji, settings.enabledQuestionTypes)[0];
      if (!question) continue;
      fallback ??= question;
      if (!used.has(question.prompt)) return question;
    }
    return fallback ?? null;
  }, [pool, settings.enabledQuestionTypes, translateKanji]);

  const finishSession = useCallback(({ score, attempts }: { score: number; attempts: number }) => {
    if (pendingStatsRef.current.length > 0) {
      saveStatResultsBatch(pendingStatsRef.current);
      pendingStatsRef.current = [];
    }
    saveQuizHistory(score, attempts - score);
  }, []);
  const session = useQuizSession({ total, onFinished: finishSession });
  const currentQuestion = deck[session.questionIndex] ?? null;

  const nextQuestion = useCallback(() => {
    if (session.feedback === null) return;
    if (session.questionIndex + 1 < total) {
      const next = buildQuestion(deck);
      if (next) setDeck((current) => [...current, next]);
      setUserAnswer("");
    }
    session.advance();
  }, [buildQuestion, deck, session, total]);

  const handleSubmit = useCallback((submission?: string | string[]) => {
    if (session.feedback !== null) { nextQuestion(); return; }
    if (!currentQuestion) return;
    const answer = submission !== undefined ? submission : userAnswer;
    const correct = answer === currentQuestion.correctAnswer;
    pendingStatsRef.current.push(...currentQuestion.targets.map((char) => ({ char, isCorrect: correct })));
    if (submission !== undefined) setUserAnswer(submission);
    session.submitAnswer(correct);
  }, [currentQuestion, nextQuestion, session, userAnswer]);

  const handleOverride = useCallback(() => {
    if (session.feedback !== false || !currentQuestion) return;
    pendingStatsRef.current.push(...currentQuestion.targets.map((char) => ({ char, isCorrect: true })));
    session.overrideAnswer();
  }, [currentQuestion, session]);

  if (!state?.selectedChars?.length) return null;

  const railContent = (
    <>
      <span className="quiz-rail-context-label">{t("quiz.selectedPool")}</span>
      <strong className="quiz-rail-context-value">{selectedChars.length} {t("quiz.characters")}</strong>
      <div className="quiz-rail-context-list">{neededLevels.map((level) => <span key={level.level}>{level.level}</span>)}</div>
    </>
  );

  if (loadState === "error") {
    return (
      <QuizWorkspace title={t("kanji.title")} sourceLabel={t("kanji.quiz.kicker")} total={total} questionIndex={0} score={0} attempts={0} railContent={railContent} backTo="/kanji" backLabel={t("quiz.quit")}>
        <section className="quiz-results-panel glass-panel"><span className="quiz-results-kicker">{t("kanji.loadError")}</span><p>{t("common.retry")}</p><button className="btn-primary" onClick={() => window.location.reload()}>{t("common.retry")}</button></section>
      </QuizWorkspace>
    );
  }

  if (session.phase === "results") {
    return (
      <QuizWorkspace title={t("kanji.title")} sourceLabel={t("kanji.quiz.kicker")} sourceDetail={t("quiz.results.subtitle")} questionIndex={total} total={total} score={session.score} attempts={session.attempts} railContent={railContent} backTo="/kanji" backLabel={t("quiz.quit")}>
        <section className="quiz-results-panel glass-panel"><span className="quiz-results-kicker">{t("quiz.results.title")}</span><div className="quiz-results-score">{session.score}<span>/ {session.attempts}</span></div><p>{t("quiz.results.accuracy")}: {session.attempts > 0 ? Math.round((session.score / session.attempts) * 100) : 0}%</p><div className="quiz-results-actions"><button className="btn-primary" onClick={() => navigate("/kanji")}>{t("kanji.backToKanji")}</button><button className="btn-secondary" onClick={() => navigate("/stats")}>{t("quiz.results.viewStats")}</button></div></section>
      </QuizWorkspace>
    );
  }

  if (loadState === "loading" || !currentQuestion) {
    return <QuizWorkspace title={t("kanji.title")} sourceLabel={t("kanji.quiz.kicker")} total={total} questionIndex={0} score={0} attempts={0} railContent={railContent} backTo="/kanji" backLabel={t("quiz.quit")}><section className="quiz-loading-panel glass-panel"><div className="quiz-loading-orb" /><span>{t("kanji.loading")}</span></section></QuizWorkspace>;
  }

  return (
    <QuizWorkspace title={t("kanji.title")} sourceLabel={t("kanji.quiz.kicker")} sourceDetail={t("kanji.quiz.subtitle")} questionIndex={session.questionIndex} total={total} score={session.score} attempts={session.attempts} railContent={railContent} backTo="/kanji" backLabel={t("quiz.quit")}>
      <QuizCard question={currentQuestion} userAnswer={userAnswer as string} isCorrect={session.feedback} onAnswer={setUserAnswer} onSubmit={handleSubmit} onOverride={handleOverride} />
    </QuizWorkspace>
  );
};
