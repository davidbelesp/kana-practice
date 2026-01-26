import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Stats } from "./pages/Stats";
import { FreeCanvas } from "./pages/FreeCanvas";
import "./App.css";
import { ThemeSwitcher } from "./components/ThemeSwitcher";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/canvas" element={<FreeCanvas />} />
        </Routes>
        <ThemeSwitcher />
      </div>
    </Router>
  );
}

export default App;
