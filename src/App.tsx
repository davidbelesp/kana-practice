import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Stats } from "./pages/Stats";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <ThemeSwitcher />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
