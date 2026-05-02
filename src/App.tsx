import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Index } from "./pages/Index";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import "./App.css";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";

const Quiz = lazy(() => import("./pages/Quiz").then(m => ({ default: m.Quiz })));
const Stats = lazy(() => import("./pages/Stats").then(m => ({ default: m.Stats })));
const FreeCanvas = lazy(() => import("./pages/FreeCanvas").then(m => ({ default: m.FreeCanvas })));
const KanjiPage = lazy(() => import("./pages/KanjiPage").then(m => ({ default: m.KanjiPage })));
const KanjiQuiz = lazy(() => import("./pages/KanjiQuiz").then(m => ({ default: m.KanjiQuiz })));
const Vocabulary = lazy(() => import("./pages/Vocabulary").then(m => ({ default: m.Vocabulary })));
const Numbers = lazy(() => import("./pages/Numbers").then(m => ({ default: m.Numbers })));

const PageLoader = () => (
  <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
    <div className="loading">Loading...</div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </div>
  );
};

export default App;
