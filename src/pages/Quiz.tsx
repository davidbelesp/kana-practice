import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { allKanaData } from "../data/kana";
import { QuizCard } from "../components/QuizCard";
import { generateQuestion } from "../utils/questionGenerator";
import { saveStatResult, saveQuizHistory } from "../utils/statsManager";
import { type QuizQuestion } from "../types/QuizTypes";
import "./Quiz.css";

interface QuizState {
  selectedChars: string[];
}

export const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizState;

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null,
  );
  const [userAnswer, setUserAnswer] = useState<string | string[]>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!state?.selectedChars || state.selectedChars.length === 0) {
      navigate("/");
    } else {
      nextQuestion();
    }
  }, [state, navigate]);

  const pool = useMemo(() => {
    if (!state?.selectedChars) return [];
    return allKanaData.filter((k) => state.selectedChars.includes(k.char));
  }, [state]);

  const maxQuestions = (state?.selectedChars?.length || 0) * 3;

  const nextQuestion = () => {
    if (!pool.length) return;

    if (attempts >= maxQuestions) {
      saveQuizHistory(score, attempts - score);
      setIsFinished(true);
      return;
    }

    const next = generateQuestion(pool);
    setCurrentQuestion(next);
    setUserAnswer(next.type === "sequence-order" ? [] : "");
    setIsCorrect(null);
  };

  const handleSubmit = (submission?: string | string[]) => {
    if (isCorrect !== null) {
      nextQuestion();
      return;
    }

    if (!currentQuestion) return;
    const answerToCheck = submission !== undefined ? submission : userAnswer;

    let correct = false;
    if (currentQuestion.type === "sequence-order") {
      const expected = currentQuestion.correctAnswer as string[];
      const actual = answerToCheck as string[];
      if (
        expected.length === actual.length &&
        expected.every((v, i) => v === actual[i])
      ) {
        correct = true;
      }
    } else {
      correct = answerToCheck === currentQuestion.correctAnswer;
    }

    // Save Stats
    if (currentQuestion.targets) {
      currentQuestion.targets.forEach((char) => {
        saveStatResult(char, correct);
      });
    }

    if (submission !== undefined) {
      setUserAnswer(submission);
    }

    setIsCorrect(correct);
    setAttempts((p) => p + 1);
    if (correct) setScore((p) => p + 1);
  };

  if (isFinished) {
    return (
      <div className="quiz-container container results-screen">
        <div className="glass-panel results-card">
          <h2>Quiz Complete!</h2>
          <div className="final-score">
            {score} / {attempts}
          </div>
          <p>
            Accuracy: {attempts > 0 ? Math.round((score / attempts) * 100) : 0}%
          </p>
          <div className="actions">
            <button className="btn-primary" onClick={() => navigate("/")}>
              Back to Home
            </button>
            <button className="btn-text" onClick={() => navigate("/stats")}>
              View Stats
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="loading">Loading...</div>;
  return (
    <div className="quiz-container container">
      <header className="quiz-header">
        <button
          className="btn-secondary back-btn"
          onClick={() => navigate("/")}
        >
          ← Quit
        </button>
        <div className="score-display">
          Score: {score} / {attempts}
        </div>
      </header>
      <main className="quiz-main">
        <QuizCard
          question={currentQuestion}
          userAnswer={userAnswer}
          isCorrect={isCorrect}
          onAnswer={setUserAnswer}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
};
