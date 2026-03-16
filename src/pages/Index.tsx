import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Index.css";

const TITLE_TEXT = "日本語の Hub".split("");

const generateRandomStyles = () => {
  return TITLE_TEXT.map(() => {
    const angle = (Math.random() - 0.5) * 40; // max 20deg rotation
    const x = (Math.random() - 0.5) * 60;     // max 30px translation
    const y = (Math.random() - 0.5) * 60;
    return {
      "--hover-rotate": `${angle}deg`,
      "--hover-x": `${x}px`,
      "--hover-y": `${y}px`,
    } as React.CSSProperties;
  });
};

export const Index: React.FC = () => {

  const [letterStyles, setLetterStyles] = useState<React.CSSProperties[]>(generateRandomStyles);

  const handleMouseEnter = () => {
    setLetterStyles(generateRandomStyles());
  };

  return (
    <div className="index-container">
      <h1 className="index-title" onMouseEnter={handleMouseEnter}>
        {TITLE_TEXT.map((char, i) => (
          <span key={i} className="title-letter" style={letterStyles[i] || {}}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <p className="index-subtitle">Master Japanese with Interactive Tools</p>

      <div className="index-grid">
        <Link to="/practice" className="index-card large">
          <div className="card-icon">🎌</div>
          <h2 className="card-title">Kana Practice</h2>
          <p className="card-desc">
            Practice reading Hiragana and Katakana characters to build your
            foundation.
          </p>
        </Link>

        <Link to="/stats" className="index-card">
          <div className="card-icon">📊</div>
          <h2 className="card-title">Stats</h2>
          <p className="card-desc">
            Track your learning progress, accuracy, and see how much you've
            improved.
          </p>
        </Link>

        <Link to="/canvas" className="index-card">
          <div className="card-icon">🖌️</div>
          <h2 className="card-title">Free Canvas</h2>
          <p className="card-desc">
            Practice writing Japanese characters freely on a digital canvas.
          </p>
        </Link>

        <Link to="/kanji" className="index-card large">
          <div className="card-icon">漢字</div>
          <h2 className="card-title">Kanjis</h2>
          <p className="card-desc">
            Explore JLPT levels, check Kanji details, and initiate practice sessions based on meaning.
          </p>
        </Link>
        
        <div className="index-card disabled">
          <div className="card-badge">Coming Soon</div>
          <div className="card-icon">123</div>
          <h2 className="card-title">Numbers</h2>
          <p className="card-desc">
            Learn and practice reading Japanese numbers and counting systems.
          </p>
        </div>
      </div>
    </div>
  );
};
