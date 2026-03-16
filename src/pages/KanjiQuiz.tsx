import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { n5kanjiData, n4kanjiData, n3kanjiData, n2kanjiData } from "../data/kanji";
import { QuizCard } from "../components/QuizCard";
import { generateKanjiQuizDeck } from "../utils/kanjiQuestionGenerator";
import { saveStatResult, saveQuizHistory } from "../utils/statsManager";
import { type QuizQuestion } from "../types/QuizTypes";
import "./Quiz.css";

interface QuizState {
  selectedChars: string[];
}

const allKanjiData = [
    ...n5kanjiData,
    ...n4kanjiData,
    ...n3kanjiData,
    ...n2kanjiData,
];

export const KanjiQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizState;

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | string[]>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [deck] = useState<QuizQuestion[]>(() => {
    const p = allKanjiData.filter((k) => state?.selectedChars?.includes(k.char));
    return generateKanjiQuizDeck(p, Math.min(60, p.length));
  });
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!state?.selectedChars || state.selectedChars.length === 0) {
      navigate("/kanji");
    } else if (deck.length > 0) {
      setCurrentQuestion(deck[0]);
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

    setCurrentQuestion(deck[attempts]);
    setUserAnswer("");
    setIsCorrect(null);
  };

  const handleSubmit = (submission?: string | string[]) => {
    if (isCorrect !== null) {
      nextQuestion();
      return;
    }

    if (!currentQuestion) return;
    const answerToCheck = submission !== undefined ? submission : userAnswer;

    let correct = answerToCheck === currentQuestion.correctAnswer;

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
            <button className="btn-primary" onClick={() => navigate("/kanji")}>
              Back to Kanji
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
          onClick={() => navigate("/kanji")}
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
            userAnswer={userAnswer as string} /* Cast to string, kanji quiz doesn't use sequence-order */
            isCorrect={isCorrect}
            onAnswer={(ans) => setUserAnswer(ans)}
            onSubmit={handleSubmit}
            onOverride={handleOverride}
          />
        </div>
      </main>
    </div>
  );
};
