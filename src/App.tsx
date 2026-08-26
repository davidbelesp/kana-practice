import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Index } from "./pages/Index";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import "./App.css";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { AccountProvider } from "./contexts/AccountContext";
import { RouteSkeleton } from "./components/ui/RouteSkeleton";
import { RouteErrorBoundary } from "./components/ui/RouteErrorBoundary";
import { loadRoutePage, schedulePrimaryRoutePrefetch } from "./utils/routeRegistry";

const Quiz = lazy(() => loadRoutePage("quiz").then(m => ({ default: m.Quiz as typeof import("./pages/Quiz")["Quiz"] })));
const Stats = lazy(() => loadRoutePage("stats").then(m => ({ default: m.Stats as typeof import("./pages/Stats")["Stats"] })));
const FreeCanvas = lazy(() => loadRoutePage("canvas").then(m => ({ default: m.FreeCanvas as typeof import("./pages/FreeCanvas")["FreeCanvas"] })));
const KanjiPage = lazy(() => loadRoutePage("kanji").then(m => ({ default: m.KanjiPage as typeof import("./pages/KanjiPage")["KanjiPage"] })));
const KanjiQuiz = lazy(() => loadRoutePage("kanjiQuiz").then(m => ({ default: m.KanjiQuiz as typeof import("./pages/KanjiQuiz")["KanjiQuiz"] })));
const Vocabulary = lazy(() => loadRoutePage("vocabulary").then(m => ({ default: m.Vocabulary as typeof import("./pages/Vocabulary")["Vocabulary"] })));
const VocabularyQuiz = lazy(() => loadRoutePage("vocabularyQuiz").then(m => ({ default: m.VocabularyQuiz as typeof import("./pages/VocabularyQuiz")["VocabularyQuiz"] })));
const Numbers = lazy(() => loadRoutePage("numbers").then(m => ({ default: m.Numbers as typeof import("./pages/Numbers")["Numbers"] })));
const Grammar = lazy(() => loadRoutePage("grammar").then(m => ({ default: m.Grammar as typeof import("./pages/Grammar")["Grammar"] })));
const GrammarQuiz = lazy(() => loadRoutePage("grammarQuiz").then(m => ({ default: m.GrammarQuiz as typeof import("./pages/GrammarQuiz")["GrammarQuiz"] })));
const Login = lazy(() => loadRoutePage("login").then(m => ({ default: m.Login as typeof import("./pages/Login")["Login"] })));
const CreateAccount = lazy(() => loadRoutePage("createAccount").then(m => ({ default: m.CreateAccount as typeof import("./pages/CreateAccount")["CreateAccount"] })));

function App() {
  const basename = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <SettingsProvider>
      <Router basename={basename}>
        <AccountProvider>
          <NotificationProvider>
            <SettingsContextConsumer />
          </NotificationProvider>
        </AccountProvider>
      </Router>
    </SettingsProvider>
  );
}

const SettingsContextConsumer = () => {
  const { settings } = useSettings();
  useEffect(() => schedulePrimaryRoutePrefetch(), []);
  return (
    <div className={`app-container ${!settings.animationsEnabled ? "no-animations" : ""}`}>
      <RouteErrorBoundary>
        <Suspense fallback={<RouteSkeleton />}>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/practice" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/kanji-quiz" element={<KanjiQuiz />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/canvas" element={<FreeCanvas />} />
          <Route path="/kanji" element={<KanjiPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/vocabulary-quiz" element={<VocabularyQuiz />} />
          <Route path="/numbers" element={<Numbers />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/grammar/:trackId/:lessonId" element={<Grammar />} />
          <Route path="/grammar/:trackId/:lessonId/practice" element={<GrammarQuiz />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </div>
  );
};

export default App;
