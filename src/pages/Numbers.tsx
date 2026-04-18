import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { numberToJapanese, checkNumberAnswer } from "../utils/numberToJapanese";
import "./Numbers.css";

type Mode = "romaji" | "hiragana";
type Status = "correct" | "incorrect" | null;

function randomNumber() {
  return Math.floor(Math.random() * 10000) + 1;
}

export const Numbers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [number, setNumber] = useState(() => randomNumber());
  const [mode, setMode] = useState<Mode>("romaji");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const japanese = numberToJapanese(number);

  useEffect(() => {
    if (status === null) inputRef.current?.focus();
  }, [number, status]);

  const nextNumber = () => {
    setNumber(randomNumber());
    setInput("");
    setStatus(null);
  };

  const handleSubmit = () => {
    if (status !== null) {
      nextNumber();
      return;
    }
    if (!input.trim()) return;

    const correct = checkNumberAnswer(number, input, mode);
    setAttempts(a => a + 1);
    if (correct) setScore(s => s + 1);
    setStatus(correct ? "correct" : "incorrect");
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInput("");
    setStatus(null);
  };

  return (
    <div className="numbers-container container">
      <header className="quiz-header">
        <button className="btn-secondary back-btn" onClick={() => navigate("/")}>
          ← {t("common.back")}
        </button>
        <div className="score-display">
          {t("quiz.results.score")}: {score} / {attempts}
        </div>
      </header>

      <main className="quiz-main">
        <div className="quiz-content-wrapper">
          <div className={classNames("numbers-card glass-panel", status)}>
            <div className="quiz-question">
              <span className="question-type">{t("numbers.prompt")}</span>
              <div className="numbers-display">{number.toLocaleString()}</div>
            </div>

            <div className="mode-toggle">
              <button
                className={classNames("mode-btn", { active: mode === "romaji" })}
                onClick={() => handleModeChange("romaji")}
              >
                {t("numbers.mode.romaji")}
              </button>
              <button
                className={classNames("mode-btn", { active: mode === "hiragana" })}
                onClick={() => handleModeChange("hiragana")}
              >
                {t("numbers.mode.hiragana")}
              </button>
            </div>

            <input
              ref={inputRef}
              className={classNames("numbers-input", status)}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder={t(`numbers.placeholder.${mode}`)}
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
