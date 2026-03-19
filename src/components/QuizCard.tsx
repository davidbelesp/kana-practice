import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Play, Eye, EyeOff } from "lucide-react";
import type { QuizQuestion } from "../types/QuizTypes";
import { KanaCanvas, type KanaCanvasRef } from "./KanaCanvas";
import { speakJapanese } from "../utils/speechUtils";
import "./QuizCard.css";

interface QuizCardProps {
  question: QuizQuestion;
  userAnswer: string | string[];
  isCorrect: boolean | null;
  onAnswer: (val: string | string[]) => void;
  onSubmit: (val?: string | string[]) => void;
  onOverride?: () => void;
}

export const QuizCard = ({
  question,
  userAnswer,
  isCorrect,
  onAnswer,
  onSubmit,
  onOverride,
}: QuizCardProps) => {
  const { t } = useTranslation();
  const isSequence = question.type === "sequence-order";
  const isDrawing = question.type === "drawing-kana";
  const isListening = question.type === "listening-choice";
  const isSubmitted = isCorrect !== null;

  const canvasRef = useRef<KanaCanvasRef>(null);
  const [showHint, setShowHint] = useState(false);

  // Auto-play audio for listening questions
  useEffect(() => {
    if (isListening && !isSubmitted) {
      speakJapanese(question.prompt);
    }
    // Reset hint when question changes
    setShowHint(false);
  }, [question, isListening, isSubmitted]);

  const handleOptionClick = (option: string) => {
    if (isSubmitted) return;
    onAnswer(option);
    // Auto-submit for non-sequence types
    if (!isSequence && !isDrawing) {
      onSubmit(option);
    }
  };

  const handlePoolClick = (char: string) => {
    if (isSubmitted) return;
    const currentSequence = (
      Array.isArray(userAnswer) ? userAnswer : []
    ) as string[];
    // Don't exceed expected length
    if (currentSequence.length >= (question.correctAnswer as string[]).length)
      return;

    onAnswer([...currentSequence, char]);
  };

  const handleSlotClick = (index: number) => {
    if (isSubmitted) return;
    const currentSequence = (
      Array.isArray(userAnswer) ? userAnswer : []
    ) as string[];
    const newSequence = currentSequence.filter((_, i) => i !== index);
    onAnswer(newSequence);
  };

  const handleDrawingParams = (accuracy: number) => {
    // 70% threshold
    const passed = accuracy >= 70;
    const result = passed ? (question.correctAnswer as string) : "FAILED_DRAW";
    onSubmit(result);
  };

  const handleDrawingCheck = () => {
    if (canvasRef.current) {
      canvasRef.current.check();
    }
  };

  const renderChoiceOptions = () => {
    return (
      <div className="options-grid">
        {question.options.map((opt, idx) => {
          let stateClass = "";
          if (isSubmitted) {
            if (opt === question.correctAnswer) stateClass = "correct";
            else if (opt === userAnswer && !isCorrect) stateClass = "incorrect";
          } else {
            if (opt === userAnswer) stateClass = "selected";
          }

          return (
            <button
              key={idx}
              className={classNames("option-btn", stateClass)}
              onClick={() => handleOptionClick(opt)}
              disabled={isSubmitted}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const renderSequenceBuilder = () => {
    const sequence = (Array.isArray(userAnswer) ? userAnswer : []) as string[];
    const requiredLength = (question.correctAnswer as string[]).length;

    const slots = Array(requiredLength)
      .fill(null)
      .map((_, i) => sequence[i] || null);

    return (
      <div className="sequence-area">
        <div className="sequence-slots">
          {slots.map((char, idx) => (
            <div
              key={idx}
              className={classNames("seq-slot", { filled: !!char })}
              onClick={() => char && handleSlotClick(idx)}
              style={{
                cursor: isSubmitted ? "default" : char ? "pointer" : "default",
              }}
            >
              {char}
            </div>
          ))}
        </div>

        <div className="sequence-pool">
          {question.options.map((char, idx) => {
            return (
              <button
                key={idx}
                className="pool-btn"
                onClick={() => handlePoolClick(char)}
                disabled={isSubmitted}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDrawingArea = () => {
    return (
      <KanaCanvas
        ref={canvasRef}
        targetChar={question.correctAnswer as string}
        onVerify={handleDrawingParams}
        isRevealed={isSubmitted}
      />
    );
  };

  const renderListeningPrompt = () => {
    return (
      <div className="listening-area">
        <div className="listening-controls">
          <button 
            className="play-btn-large" 
            onClick={() => speakJapanese(question.prompt)}
            aria-label="Play audio"
          >
            <div className="play-icon-container">
              <Play size={32} fill="currentColor" />
            </div>
            <span className="play-label">{t("quiz.actions.playAudio")}</span>
          </button>

          <button 
            className="btn-secondary hint-btn-side"
            onClick={() => setShowHint(!showHint)}
            title={showHint ? t("quiz.actions.hideHint") : t("quiz.actions.showHint")}
            aria-label={showHint ? t("quiz.actions.hideHint") : t("quiz.actions.showHint")}
          >
            {showHint ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>

        <div className="listening-hint-container">
          <div className={classNames("listening-hint-text", { visible: showHint })}>
            {question.hint || question.prompt}
          </div>
        </div>
      </div>
    );
  };

  const getPromptLabel = () => {
    switch (question.type) {
      case "single-choice-romaji":
        return t("quiz.prompts.romaji");
      case "single-choice-kana":
        return t("quiz.prompts.kana");
      case "sequence-order":
        return t("quiz.prompts.sequence");
      case "pair-match":
        return t("quiz.prompts.pair");
      case "drawing-kana":
        return t("quiz.prompts.drawing");
      case "listening-choice":
        return t("quiz.prompts.listening");
      default:
        return t("quiz.prompts.default");
    }
  };

  // Logic for submit button click
  const onMainSubmit = () => {
    if (isDrawing && !isSubmitted) {
      handleDrawingCheck();
    } else {
      onSubmit();
    }
  };

  return (
    <div
      className={classNames("quiz-card glass-panel", {
        correct: isCorrect === true,
        incorrect: isCorrect === false,
      })}
    >
      <div className="quiz-question">
        <span className="question-type">{getPromptLabel()}</span>
        {!isListening && <div className="main-char">{question.prompt}</div>}
      </div>

      {isSequence
        ? renderSequenceBuilder()
        : isDrawing
          ? renderDrawingArea()
          : (
            <>
              {isListening && renderListeningPrompt()}
              {renderChoiceOptions()}
            </>
          )}

      <div className="quiz-actions">
        <button
          className="btn-primary submit-btn"
          onClick={onMainSubmit}
          disabled={
            !isSubmitted &&
            (isSequence
              ? (userAnswer as string[]).length !==
                (question.correctAnswer as string[]).length
              : isDrawing
                ? false
                : !userAnswer)
          }
        >
          {isCorrect === null ? t("quiz.actions.check") : t("quiz.actions.next")}
        </button>
      </div>

      <div className="feedback-container">
        {isCorrect === false && (
          <div className="feedback incorrect">
            <div className="feedback-content">
              <span>{t("quiz.feedback.incorrect")}</span>
              <span className="answer">
                {Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join("")
                  : question.correctAnswer}
              </span>
            </div>
            {isDrawing && onOverride && (
              <button
                className="btn-secondary btn-sm override-btn"
                onClick={onOverride}
                style={{ marginTop: "0.5rem", marginLeft: "1rem" }}
              >
                {t("quiz.actions.override")}
              </button>
            )}
          </div>
        )}

        {isCorrect === true && <div className="feedback correct">{t("quiz.feedback.correct")}</div>}
      </div>
    </div>
  );
};
