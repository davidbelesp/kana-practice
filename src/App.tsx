import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Index } from "./pages/Index";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Stats } from "./pages/Stats";
import { FreeCanvas } from "./pages/FreeCanvas";
import { KanjiPage } from "./pages/KanjiPage";
import { KanjiQuiz } from "./pages/KanjiQuiz";
import "./App.css";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/practice" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/kanji-quiz" element={<KanjiQuiz />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/canvas" element={<FreeCanvas />} />
            <Route path="/kanji" element={<KanjiPage />} />
          </Routes>
          <ThemeSwitcher />
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;
