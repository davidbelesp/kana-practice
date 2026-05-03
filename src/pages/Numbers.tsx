import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { numberToJapanese, checkNumberAnswer } from "../utils/numberToJapanese";
import { useSettings } from "../contexts/SettingsContext";
import { BackButton } from "../components/ui/BackButton";
import "./Numbers.css";

type QuestionMode = "typing" | "multiple-choice";
type Status = "correct" | "incorrect" | null;

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDistractors(correct: number, min: number, max: number): number[] {
  const distractors = new Set<number>();
  const range = max - min;

  const strategies: Array<() => number> = [
    // Off by one digit position
    () => correct + (Math.random() < 0.5 ? 1 : -1) * Math.pow(10, Math.floor(Math.log10(correct))),
    // Same digit count, similar value
    () => correct + (Math.floor(Math.random() * 9) + 1) * Math.pow(10, Math.floor(Math.log10(correct) - 1)),
    // Swap two inner digits
    () => {
      const s = String(correct).split("");
      if (s.length >= 2) {
        const i = Math.floor(Math.random() * (s.length - 1));
        [s[i], s[i + 1]] = [s[i + 1], s[i]];
      }
      return Math.max(min, Math.min(max, parseInt(s.join(""), 10)));
    },
    // Double or half
    () => Math.random() < 0.5 ? correct * 2 : Math.max(1, Math.floor(correct / 2)),
    // Small random offset
    () => correct + (Math.floor(Math.random() * Math.max(10, range / 10)) + 1) * (Math.random() < 0.5 ? 1 : -1),
  ];

  let attempts = 0;
  while (distractors.size < 3 && attempts < 60) {
    attempts++;
    const fn = strategies[Math.floor(Math.random() * strategies.length)];
    const candidate = Math.round(fn());
    if (candidate !== correct && candidate >= Math.max(1, min) && candidate <= max && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
  }

  // Fallback: sequential neighbours
  let offset = 1;
  while (distractors.size < 3) {
    const c = correct + offset;
    if (c !== correct && c >= 1 && !distractors.has(c)) distractors.add(c);
    offset++;
  }

  return Array.from(distractors);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const Numbers = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { numbersMin, numbersMax } = settings;

  const [questionMode, setQuestionMode] = useState<QuestionMode>("typing");
  const [number, setNumber] = useState(() => randomInRange(numbersMin, numbersMax));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const japanese = useMemo(() => numberToJapanese(number), [number]);

  const buildChoices = useCallback((n: number) => {
    const distractors = generateDistractors(n, numbersMin, numbersMax);
    return shuffle([n, ...distractors]);
  }, [numbersMin, numbersMax]);

  const nextNumber = useCallback(() => {
    const n = randomInRange(numbersMin, numbersMax);
    setNumber(n);
    setInput("");
    setStatus(null);
    if (questionMode === "multiple-choice") {
      setChoices(buildChoices(n));
    }
  }, [numbersMin, numbersMax, questionMode, buildChoices]);

  useEffect(() => {
    const n = randomInRange(numbersMin, numbersMax);
    setNumber(n);
    setInput("");
    setStatus(null);
    if (questionMode === "multiple-choice") {
      setChoices(buildChoices(n));
    }
  }, [questionMode, numbersMin, numbersMax, buildChoices]);

  useEffect(() => {
    if (status === null && questionMode === "typing") inputRef.current?.focus();
  }, [number, status, questionMode]);

  const handleSubmit = useCallback(() => {
    if (status !== null) {
      nextNumber();
      return;
    }
    if (!input.trim()) return;

    const correct = checkNumberAnswer(number, input);
    setAttempts(a => a + 1);
    if (correct) setScore(s => s + 1);
    setStatus(correct ? "correct" : "incorrect");
  }, [status, input, number, nextNumber]);

  const handleChoiceSelect = useCallback((choice: number) => {
    if (status !== null) return;
    const correct = choice === number;
    setAttempts(a => a + 1);
    if (correct) setScore(s => s + 1);
    setStatus(correct ? "correct" : "incorrect");
  }, [status, number]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  }, [handleSubmit]);

  const handleTypingMode = useCallback(() => setQuestionMode("typing"), []);
  const handleMultipleChoiceMode = useCallback(() => setQuestionMode("multiple-choice"), []);

  return (
    <div className="numbers-container container">
      <header className="quiz-header">
        <BackButton to="/" />
        <div className="score-display">
          {t("quiz.results.score")}: {score} / {attempts}
        </div>
      </header>

      <div className="numbers-mode-toggle">
        <button
          className={classNames("mode-btn", { active: questionMode === "typing" })}
          onClick={handleTypingMode}
        >
          {t("numbers.modeTyping")}
        </button>
        <button
          className={classNames("mode-btn", { active: questionMode === "multiple-choice" })}
          onClick={handleMultipleChoiceMode}
        >
          {t("numbers.modeChoice")}
        </button>
      </div>

      <main className="quiz-main">
        <div className="quiz-content-wrapper">
          <div className={classNames("numbers-card glass-panel", status)}>

            {questionMode === "typing" ? (
              <>
                <div className="quiz-question">
                  <span className="question-type">{t("numbers.prompt")}</span>
                  <div className="numbers-display">{number.toLocaleString()}</div>
                </div>

                <input
                  ref={inputRef}
                  className={classNames("numbers-input", status)}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("numbers.placeholder")}
                  disabled={status !== null}
                  autoComplete="off"
                  autoCapitalize="none"
                />

                <div className="quiz-actions">
                  <button
                    className="btn-primary submit-btn"
                    onClick={handleSubmit}
                    disabled={status === null && !input.trim()}
                  >
                    {status !== null ? t("numbers.next") : t("quiz.actions.check")}
                  </button>
                  {status === null && (
                    <button className="btn-secondary" onClick={nextNumber}>
                      {t("numbers.skip")}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="quiz-question">
                  <span className="question-type">{t("numbers.promptChoice")}</span>
                  <div className="numbers-reading">{japanese.romaji}</div>
                  <div className="numbers-reading-hiragana">{japanese.hiragana}</div>
                </div>

                <div className="numbers-choices">
                  {choices.map(c => (
                    <button
                      key={c}
                      className={classNames("numbers-choice-btn", {
                        correct: status !== null && c === number,
                        incorrect: status !== null && c !== number,
                        selected: status !== null,
                      })}
                      onClick={() => handleChoiceSelect(c)}
                      disabled={status !== null}
                    >
                      {c.toLocaleString()}
                    </button>
                  ))}
                </div>

                {status !== null && (
                  <button className="btn-primary submit-btn" onClick={nextNumber}>
                    {t("numbers.next")}
                  </button>
                )}
              </>
            )}

            <div className="feedback-container">
              {status === "correct" && (
                <div className="feedback correct">{t("quiz.feedback.correct")}</div>
              )}
              {status === "incorrect" && (
                <div className="feedback incorrect">
                  <span>{t("quiz.feedback.incorrect")}</span>
                  <div className="numbers-answer">
                    <span className="answer">{japanese.romaji}</span>
                    <span className="numbers-answer-hiragana">{japanese.hiragana}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
