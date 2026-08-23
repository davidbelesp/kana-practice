import { useCallback, useRef, useState } from "react";

export type QuizSessionPhase = "answering" | "feedback" | "results";

interface UseQuizSessionOptions {
  total: number;
  onFinished?: (summary: { score: number; attempts: number }) => void;
}

export const useQuizSession = ({ total, onFinished }: UseQuizSessionOptions) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<QuizSessionPhase>("answering");
  const finishedRef = useRef(false);

  const submitAnswer = useCallback((correct: boolean) => {
    if (phase !== "answering") return false;
    setAttempts((value) => value + 1);
    setScore((value) => value + (correct ? 1 : 0));
    setFeedback(correct);
    setPhase("feedback");
    return true;
  }, [phase]);

  const overrideAnswer = useCallback(() => {
    if (phase !== "feedback" || feedback !== false) return false;
    setScore((value) => value + 1);
    setFeedback(true);
    return true;
  }, [feedback, phase]);

  const advance = useCallback(() => {
    if (phase !== "feedback") return false;
    const nextIndex = questionIndex + 1;
    if (nextIndex >= total) {
      setPhase("results");
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinished?.({ score, attempts });
      }
      return true;
    }
    setQuestionIndex(nextIndex);
    setFeedback(null);
    setPhase("answering");
    return true;
  }, [attempts, onFinished, phase, questionIndex, score, total]);

  const restart = useCallback(() => {
    finishedRef.current = false;
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setFeedback(null);
    setPhase("answering");
  }, []);

  return {
    attempts,
    advance,
    feedback,
    overrideAnswer,
    phase,
    questionIndex,
    restart,
    score,
    submitAnswer,
    total,
  };
};
