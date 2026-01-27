import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Stats } from "./pages/Stats";
import { FreeCanvas } from "./pages/FreeCanvas";
import "./App.css";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/canvas" element={<FreeCanvas />} />
          </Routes>
          <ThemeSwitcher />
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;
