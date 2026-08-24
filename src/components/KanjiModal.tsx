import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { KanjiChar } from "../data/kanjiTypes";
import { useNotification } from "../contexts/NotificationContext";
import "./KanjiModal.css";

interface KanjiModalProps {
  kanji: KanjiChar;
  level?: string;
  onClose: () => void;
}

export const KanjiModal: React.FC<KanjiModalProps> = ({ kanji, level, onClose }) => {
  const { t } = useTranslation(["translation", "kanji_meanings"]);
  const { showNotification } = useNotification();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const translatedMeaning = t(`kanji_meanings:${kanji.char}`, { defaultValue: kanji.meaning });

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(kanji.char);
      } else {
        const helper = document.createElement("textarea");
        helper.value = kanji.char;
        helper.setAttribute("readonly", "true");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Clipboard copy failed");
      }
      showNotification(t("kanji.copySuccess"), "success");
    } catch {
      showNotification(t("kanji.copyError"), "error");
    }
  }, [kanji.char, showNotification, t]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="kanji-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="kanji-modal-content" role="dialog" aria-modal="true" aria-labelledby="kanji-modal-title">
        <header className="kanji-modal-header">
          <div className="kanji-modal-topline">
            <span className="kanji-modal-eyebrow">{t("kanji.details")}</span>
            <div className="kanji-modal-header-actions">
              {level && <span className="kanji-modal-level">JLPT {level}</span>}
              <button
                ref={closeButtonRef}
                type="button"
                className="kanji-modal-close"
                onClick={onClose}
                aria-label={t("common.close")}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
          <div className="kanji-modal-hero">
            <button type="button" className="kanji-modal-character" onClick={() => void handleCopy()} aria-label={t("kanji.copyCharacter")}>
              <span aria-hidden="true">{kanji.char}</span>
            </button>
            <div>
              <p className="kanji-modal-label">{t("kanji.meaning")}</p>
              <h2 id="kanji-modal-title">{translatedMeaning}</h2>
            </div>
          </div>
        </header>

        <div className="kanji-modal-body">
          <div className="kanji-modal-info-grid">
            <div className="kanji-modal-info-card">
              <span className="kanji-modal-label">{t("kanji.radical")}</span>
              <strong className="kanji-modal-radical">{kanji.radical}</strong>
            </div>
            <div className="kanji-modal-info-card">
              <span className="kanji-modal-label">{t("kanji.character")}</span>
              <strong>{kanji.char}</strong>
            </div>
          </div>

          <div className="kanji-readings-heading">
            <span className="kanji-modal-label">{t("kanji.readings")}</span>
            <span className="kanji-readings-line" aria-hidden="true" />
          </div>
          <div className="readings-container">
            <div className="reading-column reading-column--kunyomi">
              <h3 className="reading-title">{t("kanji.kunyomi")}</h3>
              {kanji.furigana.kunyomi?.length ? (
                <ul className="reading-list">
                  {kanji.furigana.kunyomi.map((reading, index) => <li key={`${reading}-${index}`}>{reading}</li>)}
                </ul>
              ) : <span className="no-reading">—</span>}
            </div>
            <div className="reading-column reading-column--onyomi">
              <h3 className="reading-title">{t("kanji.onyomi")}</h3>
              {kanji.furigana.onyomi?.length ? (
                <ul className="reading-list">
                  {kanji.furigana.onyomi.map((reading, index) => <li key={`${reading}-${index}`}>{reading}</li>)}
                </ul>
              ) : <span className="no-reading">—</span>}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
};
