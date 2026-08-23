import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { allKanaData } from "../data/kana";
import { QuizCard } from "../components/QuizCard";
import { QuizWorkspace } from "../components/quiz/QuizWorkspace";
import { useQuizSession } from "../components/quiz/useQuizSession";
import { generateQuizDeck } from "../utils/questionGenerator";
import { saveStatResultsBatch, saveQuizHistory } from "../utils/statsManager";
import { recordCompletedSession, recordItemResults } from "../utils/progressRepository";
import { type QuizQuestion } from "../types/QuizTypes";
import { useSettings } from "../contexts/SettingsContext";
import "./Quiz.css";

interface QuizState {
  selectedChars: string[];
  from?: string;
}

export const Quiz = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizState | null;
  const { settings } = useSettings();
  const pendingStatsRef = useRef<Array<{ char: string; isCorrect: boolean }>>([]);
  const sessionStartedAtRef = useRef(Date.now());
  const sessionIdRef = useRef(`kana-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!state?.selectedChars?.length) navigate("/", { replace: true });
  }, [navigate, state?.selectedChars?.length]);

  const selectedChars = state?.selectedChars ?? [];
  const selectedCharsSet = useMemo(() => new Set(selectedChars), [selectedChars]);
  const pool = useMemo(() => allKanaData.filter((kana) => selectedCharsSet.has(kana.char)), [selectedCharsSet]);
  const total = Math.min(settings.questionsPerQuiz, pool.length * 3);

  const buildQuestion = useCallback((previous: QuizQuestion[]) => {
    const usedPrompts = new Set(previous.map((question) => question.prompt));
    let fallback: QuizQuestion | undefined;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const question = generateQuizDeck(pool, 1, settings.enabledQuestionTypes)[0];
      if (!question) continue;
      fallback ??= question;
      if (!usedPrompts.has(question.prompt)) return question;
    }
    return fallback ?? null;
  }, [pool, settings.enabledQuestionTypes]);

  const [deck, setDeck] = useState<QuizQuestion[]>(() => {
    const first = generateQuizDeck(pool, 1, settings.enabledQuestionTypes)[0];
    return first ? [first] : [];
  });
  const [userAnswer, setUserAnswer] = useState<string | string[]>("");

  const finishSession = useCallback(({ score, attempts }: { score: number; attempts: number }) => {
    const results = pendingStatsRef.current;
    if (results.length > 0) {
      saveStatResultsBatch(results);
      pendingStatsRef.current = [];
    }
    saveQuizHistory(score, attempts - score);
    recordItemResults("kana", results.map(({ char, isCorrect }) => ({ itemId: char, correct: isCorrect })));
    recordCompletedSession({ id: sessionIdRef.current, domain: "kana", mode: "mixed", source: state?.from ?? "/practice", startedAt: sessionStartedAtRef.current, total: attempts, correct: score });
  }, [state?.from]);

  const session = useQuizSession({ total, onFinished: finishSession });
  const currentQuestion = deck[session.questionIndex] ?? null;

  const nextQuestion = useCallback(() => {
    if (session.feedback === null) return;
    if (session.questionIndex + 1 < total) {
      const next = buildQuestion(deck);
      if (next) setDeck((current) => [...current, next]);
      setUserAnswer(next?.type === "sequence-order" ? [] : "");
    }
    session.advance();
  }, [buildQuestion, deck, session, total]);

  const handleSubmit = useCallback((submission?: string | string[]) => {
    if (session.feedback !== null) {
      nextQuestion();
      return;
    }
    if (!currentQuestion) return;
    const answerToCheck = submission !== undefined ? submission : userAnswer;
    let correct = false;
    if (currentQuestion.type === "sequence-order") {
      const expected = currentQuestion.correctAnswer as string[];
      const actual = answerToCheck as string[];
      correct = expected.length === actual.length && expected.every((value, index) => value === actual[index]);
    } else {
      correct = answerToCheck === currentQuestion.correctAnswer;
    }

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
      <div className="quiz-rail-context-list">
        {selectedChars.slice(0, 12).map((character) => <span key={character}>{character}</span>)}
        {selectedChars.length > 12 && <span>+{selectedChars.length - 12}</span>}
      </div>
    </>
  );

  if (session.phase === "results") {
    return (
      <QuizWorkspace
        title={t("quiz.title")}
        sourceLabel={t("quiz.kicker")}
        sourceDetail={t("quiz.results.subtitle")}
        questionIndex={total}
        total={total}
        score={session.score}
        attempts={session.attempts}
        railContent={railContent}
        backTo={state.from ?? "/practice"}
        backLabel={t("quiz.quit")}
      >
        <section className="quiz-results-panel glass-panel">
          <span className="quiz-results-kicker">{t("quiz.results.title")}</span>
          <div className="quiz-results-score">{session.score}<span>/ {session.attempts}</span></div>
          <p>{t("quiz.results.accuracy")}: {session.attempts > 0 ? Math.round((session.score / session.attempts) * 100) : 0}%</p>
          <div className="quiz-results-actions">
            <button className="btn-primary" onClick={() => navigate(state.from ?? "/practice")}>{t("common.back")}</button>
            <button className="btn-secondary" onClick={() => navigate("/stats")}>{t("quiz.results.viewStats")}</button>
          </div>
        </section>
      </QuizWorkspace>
    );
  }

  if (!currentQuestion) {
    return (
      <QuizWorkspace title={t("quiz.title")} sourceLabel={t("quiz.kicker")} total={total} questionIndex={0} score={0} attempts={0} railContent={railContent} backTo={state.from ?? "/practice"} backLabel={t("quiz.quit")}>
        <section className="quiz-loading-panel glass-panel"><div className="quiz-loading-orb" /><span>{t("common.loading")}</span></section>
      </QuizWorkspace>
    );
  }

  return (
    <QuizWorkspace
      title={t("quiz.title")}
      sourceLabel={t("quiz.kicker")}
      sourceDetail={t("quiz.subtitle")}
      questionIndex={session.questionIndex}
      total={total}
      score={session.score}
      attempts={session.attempts}
      railContent={railContent}
      backTo={state.from ?? "/practice"}
      backLabel={t("quiz.quit")}
    >
      <QuizCard
        question={currentQuestion}
        userAnswer={userAnswer}
        isCorrect={session.feedback}
        onAnswer={setUserAnswer}
        onSubmit={handleSubmit}
        onOverride={handleOverride}
      />
    </QuizWorkspace>
  );
};
