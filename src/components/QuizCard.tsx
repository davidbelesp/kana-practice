import { useRef } from "react";
import classNames from "classnames";
import type { QuizQuestion } from "../types/QuizTypes";
import { KanaCanvas, type KanaCanvasRef } from "./KanaCanvas";
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
  const isSequence = question.type === "sequence-order";
  const isDrawing = question.type === "drawing-kana";
  const isSubmitted = isCorrect !== null;

  const canvasRef = useRef<KanaCanvasRef>(null);

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

  const getPromptLabel = () => {
    switch (question.type) {
      case "single-choice-romaji":
        return "Select correct Romaji";
      case "single-choice-kana":
        return "Select correct Hiragana";
      case "sequence-order":
        return "Arrange in Order";
      case "pair-match":
        return "Select matching Pair";
      case "drawing-kana":
        return "Draw the Character";
      default:
        return "Solve";
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
        <div className="main-char">{question.prompt}</div>
      </div>

      {isSequence
        ? renderSequenceBuilder()
        : isDrawing
          ? renderDrawingArea()
          : renderChoiceOptions()}

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
          {isCorrect === null ? "Check" : "Next"}
        </button>
      </div>

      <div className="feedback-container">
        {isCorrect === false && (
          <div className="feedback incorrect">
            <div className="feedback-content">
              <span>Correct answer: </span>
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
                Mark as Correct
              </button>
            )}
          </div>
        )}

        {isCorrect === true && <div className="feedback correct">Correct!</div>}
      </div>
    </div>
  );
};
