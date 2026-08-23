import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuizWorkspace } from "../components/quiz/QuizWorkspace";
import { useSettings } from "../contexts/SettingsContext";
import { saveQuizHistory } from "../utils/statsManager";
import { recordCompletedSession, recordItemResults } from "../utils/progressRepository";
import { generateVocabularyQuizDeck } from "../utils/vocabularyQuiz";
import { resolveVocabularyEntriesById } from "../services/vocabularySearchClient";
import type { VocabularyItem } from "../types/Vocabulary";
import type { VocabularyQuizState } from "../types/VocabularyQuiz";
import "./VocabularyQuiz.css";

export const VocabularyQuiz = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as VocabularyQuizState | null;
  const [entries, setEntries] = useState<VocabularyItem[]>([]);
  const [dictionaryState, setDictionaryState] = useState<"loading" | "ready" | "error">("loading");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [deckSeed, setDeckSeed] = useState(0);
  const historySavedRef = useRef(false);
  const sessionStartedAtRef = useRef(Date.now());
  const answerResultsRef = useRef<Array<{ itemId: string; correct: boolean }>>([]);
  const sessionIdRef = useRef(`vocabulary-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const currentLanguage = i18n.language.split("-")[0];
  const entryIds = state?.entryIds ?? [];

  useEffect(() => {
    if (!state?.entryIds?.length || state.from !== "/vocabulary") {
      navigate("/vocabulary", { replace: true });
      return;
    }

    let isCurrent = true;
    resolveVocabularyEntriesById(state.entryIds)
      .then(({ entries }) => {
        if (!isCurrent) return;
        setEntries(entries);
        setDictionaryState("ready");
      })
      .catch(() => {
        if (isCurrent) setDictionaryState("error");
      });

    return () => { isCurrent = false; };
  }, [navigate, state]);

  const selectedEntries = useMemo(() => {
    const selected = new Set(entryIds);
    return entries.filter((entry) => entry.id && selected.has(entry.id));
  }, [entries, entryIds]);

  const deck = useMemo(
    () => generateVocabularyQuizDeck(selectedEntries, settings.questionsPerQuiz, currentLanguage),
    [currentLanguage, deckSeed, selectedEntries, settings.questionsPerQuiz],
  );

  useEffect(() => {
    if (dictionaryState === "ready" && deck.length === 0 && selectedEntries.length > 0) {
      setFinished(true);
    }
  }, [deck.length, dictionaryState, selectedEntries.length]);

  const currentQuestion = deck[questionIndex];
  const isCorrect = selectedAnswer !== null && currentQuestion ? selectedAnswer === currentQuestion.correctAnswer : null;

  const finish = () => {
    if (!historySavedRef.current) {
      saveQuizHistory(score, Math.max(deck.length - score, 0));
      recordItemResults("vocabulary", answerResultsRef.current);
      recordCompletedSession({ id: sessionIdRef.current, domain: "vocabulary", mode: "multiple-choice", source: "/vocabulary", startedAt: sessionStartedAtRef.current, total: deck.length, correct: score });
      historySavedRef.current = true;
    }
    setFinished(true);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    setSelectedAnswer(answer);
    answerResultsRef.current.push({ itemId: currentQuestion.entryId, correct: answer === currentQuestion.correctAnswer });
    if (answer === currentQuestion.correctAnswer) setScore((value) => value + 1);
  };

  const handleNext = () => {
    if (questionIndex >= deck.length - 1) {
      finish();
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    historySavedRef.current = false;
    setDeckSeed((value) => value + 1);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  if (!state?.entryIds?.length) return null;

  if (dictionaryState === "loading") {
    return <QuizWorkspace title={t("vocabulary.quiz.title")} sourceLabel={t("vocabulary.quiz.kicker")} total={0} questionIndex={0} score={0} attempts={0} backTo="/vocabulary" backLabel={t("common.back")}><div className="vocabulary-quiz-loading glass-panel">{t("vocabulary.loading")}</div></QuizWorkspace>;
  }

  if (dictionaryState === "error" || (dictionaryState === "ready" && deck.length === 0)) {
    return (
      <QuizWorkspace title={t("vocabulary.quiz.title")} sourceLabel={t("vocabulary.quiz.kicker")} total={deck.length} questionIndex={0} score={0} attempts={0} backTo="/vocabulary" backLabel={t("common.back")}>
        <div className="vocabulary-quiz-container vocabulary-quiz-empty">
          <div className="glass-panel vocabulary-quiz-empty-card">
            <span className="vocabulary-quiz-kicker">{t("vocabulary.quiz.kicker")}</span>
            <h1>{t("vocabulary.quiz.notEnoughTitle")}</h1>
            <p>{t("vocabulary.quiz.notEnoughHint")}</p>
            <button className="btn-primary" onClick={() => navigate("/vocabulary")}><ArrowRight size={16} />{t("vocabulary.quiz.backToVocabulary")}</button>
          </div>
        </div>
      </QuizWorkspace>
    );
  }

  if (finished) {
    return (
      <QuizWorkspace title={t("vocabulary.quiz.title")} sourceLabel={t("vocabulary.quiz.kicker")} total={deck.length} questionIndex={deck.length} score={score} attempts={questionIndex} backTo="/vocabulary" backLabel={t("common.back")}>
        <div className="vocabulary-quiz-container vocabulary-quiz-results">
          <div className="glass-panel vocabulary-quiz-results-card">
            <span className="vocabulary-quiz-kicker">{t("vocabulary.quiz.kicker")}</span>
            <h1>{t("vocabulary.quiz.resultsTitle")}</h1>
            <div className="vocabulary-quiz-final-score">{score}<span>/ {deck.length}</span></div>
            <p>{t("vocabulary.quiz.accuracy", { percent: deck.length ? Math.round((score / deck.length) * 100) : 0 })}</p>
            <div className="vocabulary-quiz-result-actions">
              <button className="btn-primary" onClick={restart}><RotateCcw size={16} />{t("vocabulary.quiz.retry")}</button>
              <button className="btn-secondary" onClick={() => navigate("/vocabulary")}><ArrowRight size={16} />{t("vocabulary.quiz.backToVocabulary")}</button>
            </div>
          </div>
        </div>
      </QuizWorkspace>
    );
  }

  return (
    <QuizWorkspace title={t("vocabulary.quiz.title")} sourceLabel={t("vocabulary.quiz.kicker")} sourceDetail={t("vocabulary.quiz.subtitle")} total={deck.length} questionIndex={questionIndex} score={score} attempts={questionIndex} railContent={<><span className="quiz-rail-context-label">{t("vocabulary.quiz.sourceLabel")}</span><strong className="quiz-rail-context-value">{entryIds.length} {t("vocabulary.entries")}</strong></>} backTo="/vocabulary" backLabel={t("vocabulary.quiz.quit")}>
      <div className="vocabulary-quiz-container">
        <header className="vocabulary-quiz-header">
          <div>
            <span className="vocabulary-quiz-kicker">{t("vocabulary.quiz.kicker")}</span>
            <h1>{t("vocabulary.quiz.title")}</h1>
            <p>{t("vocabulary.quiz.subtitle")}</p>
          </div>
          <div className="vocabulary-quiz-score"><span>{t("vocabulary.quiz.score")}</span><strong>{score} / {questionIndex}</strong></div>
        </header>

        <div className="vocabulary-quiz-progress" aria-label={t("vocabulary.quiz.progress", { current: questionIndex + 1, total: deck.length })}>
          <div className="vocabulary-quiz-progress-meta"><span>{t("vocabulary.quiz.question", { current: questionIndex + 1, total: deck.length })}</span><span>{t("vocabulary.quiz.remaining", { count: deck.length - questionIndex - 1 })}</span></div>
          <div className="vocabulary-quiz-progress-track"><span style={{ width: `${(questionIndex / deck.length) * 100}%` }} /></div>
        </div>

        <main className="glass-panel vocabulary-question-card">
          <div className="vocabulary-question-prompt">
            <span>{t("vocabulary.quiz.chooseMeaning")}</span>
            <strong>{currentQuestion.japanese}</strong>
            <p>{currentQuestion.hiragana} <i>/ {currentQuestion.romaji || "—"}</i></p>
          </div>
          <div className="vocabulary-answer-grid" role="group" aria-label={t("vocabulary.quiz.chooseMeaning")}>
            {currentQuestion.options.map((option) => {
              const optionCorrect = selectedAnswer !== null && option === currentQuestion.correctAnswer;
              const optionWrong = selectedAnswer === option && !optionCorrect;
              return (
                <button
                  key={option}
                  className={`vocabulary-answer-option ${optionCorrect ? "correct" : ""} ${optionWrong ? "incorrect" : ""}`}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  <span>{option}</span>
                  {optionCorrect && <Check size={17} aria-hidden="true" />}
                  {optionWrong && <X size={17} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {selectedAnswer !== null && <div className={`vocabulary-answer-feedback ${isCorrect ? "correct" : "incorrect"}`} role="status"><strong>{isCorrect ? t("vocabulary.quiz.correct") : t("vocabulary.quiz.incorrect")}</strong><span>{isCorrect ? t("vocabulary.quiz.correctHint") : t("vocabulary.quiz.correctAnswer", { answer: currentQuestion.correctAnswer })}</span></div>}
          <button className="btn-primary vocabulary-next-button" onClick={handleNext} disabled={selectedAnswer === null}>{questionIndex >= deck.length - 1 ? t("vocabulary.quiz.finish") : t("vocabulary.quiz.next")}<ArrowRight size={16} /></button>
        </main>
      </div>
    </QuizWorkspace>
  );
};
