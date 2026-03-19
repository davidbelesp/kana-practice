import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Index.css";

const generateRandomStyles = (count: number) => {
  return Array.from({ length: count }).map(() => {
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
  const { t } = useTranslation();
  
  const titleText = useMemo(() => {
    const prefix = t("index.titlePrefix");
    const suffix = t("index.titleSuffix");
    return `${prefix} ${suffix}`.split("");
  }, [t]);

  const [letterStyles, setLetterStyles] = useState<React.CSSProperties[]>(() => generateRandomStyles(titleText.length));

  const handleMouseEnter = () => {
    setLetterStyles(generateRandomStyles(titleText.length));
  };

  return (
    <div className="index-container">
      <div className="title-container">
        <h1 className="index-title" onMouseEnter={handleMouseEnter}>
          {titleText.map((char, i) => (
            <span key={i} className="title-letter" style={letterStyles[i] || {}}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <Link to="/settings" className="settings-icon-tab" title={t("common.settings")}>⚙️</Link>
      </div>
      <p className="index-subtitle">{t("index.subtitle")}</p>

      <div className="index-grid">
        <Link to="/practice" className="index-card large">
          <div className="card-icon">🎌</div>
          <div className="card-body">
            <h2 className="card-title">{t("index.cards.practice")}</h2>
            <p className="card-desc">{t("index.cards.practiceDesc")}</p>
          </div>
        </Link>

        <Link to="/stats" className="index-card">
          <div className="card-icon">📊</div>
          <div className="card-body">
            <h2 className="card-title">{t("index.cards.stats")}</h2>
            <p className="card-desc">{t("index.cards.statsDesc")}</p>
          </div>
        </Link>

        <Link to="/canvas" className="index-card">
          <div className="card-icon">🖌️</div>
          <div className="card-body">
            <h2 className="card-title">{t("index.cards.canvas")}</h2>
            <p className="card-desc">{t("index.cards.canvasDesc")}</p>
          </div>
        </Link>

        <Link to="/kanji" className="index-card large">
          <div className="card-icon">漢字</div>
          <div className="card-body">
            <h2 className="card-title">{t("index.cards.kanji")}</h2>
            <p className="card-desc">{t("index.cards.kanjiDesc")}</p>
          </div>
        </Link>

        <div className="index-card disabled large">
          <div className="card-icon">🍎</div>
          <div className="card-body">
            <div className="card-badge">{t("common.comingSoon")}</div>
            <h2 className="card-title">{t("index.cards.vocabulary")}</h2>
            <p className="card-desc">{t("index.cards.vocabularyDesc")}</p>
          </div>
        </div>

        <div className="index-card disabled">
          <div className="card-icon">123</div>
          <div className="card-body">
            <div className="card-badge">{t("common.comingSoon")}</div>
            <h2 className="card-title">{t("index.cards.numbers")}</h2>
            <p className="card-desc">{t("index.cards.numbersDesc")}</p>
          </div>
        </div>
      </div>
      
      <footer className="index-footer">
        <a 
          href="https://github.com/davidbelesp/kana-practice/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {t("index.viewOnGithub")}
        </a>
      </footer>
    </div>
  );
};
