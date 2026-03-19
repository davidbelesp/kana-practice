import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { allKanaData } from "../data/kana";
import { QuizCard } from "../components/QuizCard";
import { generateQuizDeck } from "../utils/questionGenerator";
import { saveStatResult, saveQuizHistory } from "../utils/statsManager";
import { type QuizQuestion } from "../types/QuizTypes";
import { useSettings } from "../contexts/SettingsContext";
import "./Quiz.css";

interface QuizState {
  selectedChars: string[];
  from?: string;
}

export const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizState;
  const { settings } = useSettings();

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | string[]>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [deck] = useState<QuizQuestion[]>(() => {
    const p = allKanaData.filter((k) => state?.selectedChars?.includes(k.char));
    const count = Math.min(settings.questionsPerQuiz, p.length * 3); // factor of 3 to allow multiple types per char
    return generateQuizDeck(p, count, settings.enabledQuestionTypes);
  });
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!state?.selectedChars || state.selectedChars.length === 0) {
      navigate("/");
    } else if (deck.length > 0) {
      const next = deck[0];
      setCurrentQuestion(next);
      setUserAnswer(next.type === "sequence-order" ? [] : "");
    } else {
      setIsFinished(true);
    }
  }, [state, navigate, deck]);

  const maxQuestions = deck.length;

  const nextQuestion = () => {
    if (attempts >= maxQuestions) {
      saveQuizHistory(score, attempts - score);
      setIsFinished(true);
      return;
    }

    const next = deck[attempts];
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
            <button className="btn-primary" onClick={() => navigate(state?.from ?? "/")}>
              Back
            </button>
            <button className="btn-text" onClick={() => navigate("/stats")}>
              View Stats
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOverride = () => {
    if (isCorrect === false && currentQuestion) {
      setIsCorrect(true);
      setScore((p) => p + 1);
      // Register a success to balance out the failure in stats
      if (currentQuestion.targets) {
        currentQuestion.targets.forEach((char) => {
          saveStatResult(char, true);
        });
      }
    }
  };

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
        <div className="quiz-content-wrapper">
          <div className="quiz-progress-section">
            <div className="progress-info">
              <span>
                Question {attempts + 1} / {maxQuestions}
              </span>
              <span>{maxQuestions - attempts} remaining</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((attempts / maxQuestions) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <QuizCard
            question={currentQuestion}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
            onAnswer={setUserAnswer}
            onSubmit={handleSubmit}
            onOverride={handleOverride}
          />
        </div>
      </main>
    </div>
  );
};
