import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Index } from "./pages/Index";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Stats } from "./pages/Stats";
import { FreeCanvas } from "./pages/FreeCanvas";
import { KanjiPage } from "./pages/KanjiPage";
import { KanjiQuiz } from "./pages/KanjiQuiz";
import { Settings } from "./pages/Settings";
import { Vocabulary } from "./pages/Vocabulary";
import { Numbers } from "./pages/Numbers";
import "./App.css";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <Router>
        <NotificationProvider>
          <SettingsContextConsumer />
        </NotificationProvider>
      </Router>
    </SettingsProvider>
  );
}

const SettingsContextConsumer = () => {
  const { settings } = useSettings();
  return (
    <div className={`app-container ${!settings.animationsEnabled ? "no-animations" : ""}`}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/practice" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/kanji-quiz" element={<KanjiQuiz />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/canvas" element={<FreeCanvas />} />
        <Route path="/kanji" element={<KanjiPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/numbers" element={<Numbers />} />
      </Routes>
    </div>
  );
};

export default App;
