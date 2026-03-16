import React from "react";
import type { KanjiChar } from "../data/kanji";
import "./KanjiModal.css";

interface KanjiModalProps {
  kanji: KanjiChar;
  onClose: () => void;
}

export const KanjiModal: React.FC<KanjiModalProps> = ({ kanji, onClose }) => {
  return (
    <div className="kanji-modal-overlay" onClick={onClose}>
      <div className="kanji-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="kanji-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="kanji-modal-header">
          <h2 className="kanji-large-display">{kanji.char}</h2>
          <div className="kanji-meaning">{kanji.meaning}</div>
        </div>
        
        <div className="kanji-modal-body">
          <div className="info-row">
            <span className="info-label">Radical:</span>
            <span className="info-value radical">{kanji.radical}</span>
          </div>
          
          <div className="readings-container">
            <div className="reading-column">
              <h3 className="reading-title kunyomi-title">Kunyomi (Japanese)</h3>
              {kanji.furigana.kunyomi && kanji.furigana.kunyomi.length > 0 ? (
                <ul className="reading-list">
                  {kanji.furigana.kunyomi.map((reading, i) => (
                    <li key={i}>{reading}</li>
                  ))}
                </ul>
              ) : (
                <span className="no-reading">-</span>
              )}
            </div>
            
            <div className="reading-column">
              <h3 className="reading-title onyomi-title">Onyomi (Chinese)</h3>
              {kanji.furigana.onyomi && kanji.furigana.onyomi.length > 0 ? (
                <ul className="reading-list">
                  {kanji.furigana.onyomi.map((reading, i) => (
                    <li key={i}>{reading}</li>
                  ))}
                </ul>
              ) : (
                <span className="no-reading">-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
