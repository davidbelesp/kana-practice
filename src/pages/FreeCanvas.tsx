import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { KanaCanvas, type KanaCanvasRef } from "../components/KanaCanvas";
import handwriting from "../utils/handwriting";
import "./FreeCanvas.css";
import { Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";

export const FreeCanvas = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<KanaCanvasRef>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const { showNotification } = useNotification();

  const handleRecognize = async () => {
    if (!canvasRef.current) return;

    const paths = await canvasRef.current.getPaths();
    if (!paths || paths.length === 0) return;

    setIsRecognizing(true);

    const trace = paths.map((p: any) => {
      // p contains paths: { x, y }[]
      const strokeX: number[] = [];
      const strokeY: number[] = [];
      const strokeT: number[] = [];

      p.paths.forEach((point: any) => {
        strokeX.push(point.x);
        strokeY.push(point.y);
        strokeT.push(0);
      });

      return [strokeX, strokeY, strokeT];
    });

    // Handwriting.recognize(trace, options, callback)
    handwriting.recognize(
      trace,
      {
        language: "ja",
        numOfReturn: 10,
      },
      (results: string[]) => {
        setCandidates(results);
        setIsRecognizing(false);
      },
      (err: any) => {
        console.error(err);
        setIsRecognizing(false);
      },
    );
  };

  const handleCopy = async (char: string) => {
    try {
      await navigator.clipboard.writeText(char);
      showNotification(t("canvas.copySuccess"), "success");
    } catch (err) {
      console.error("Failed to copy:", err);
      showNotification(t("canvas.copyError"), "error");
    }
  };

  return (
    <div className="free-canvas-container container">
      <header className="free-header">
        <Link to="/" className="btn-secondary back-btn">
          ← {t("common.home")}
        </Link>
        <h2 className="title free-practice-title">{t("canvas.title")}</h2>
      </header>

      <div className="canvas-area">
        <KanaCanvas
          ref={canvasRef}
          targetChar="" // No target
          isRevealed={false}
          onVerify={() => {}} // Score scoring ignored
        />

        <button
          className="btn-primary recognize-btn"
          onClick={handleRecognize}
          disabled={isRecognizing}
        >
          {isRecognizing ? t("canvas.thinking") : t("canvas.recognize")}
        </button>
      </div>

      <div className="candidates-list">
        {candidates.length > 0 ? (
          <div className="candidates-grid">
            {candidates.map((char, i) => (
              <div
                key={i}
                className="candidate-card"
                onClick={() => handleCopy(char)}
                title={t("canvas.copyTitle")}
              >
                <span className="candidate-char">{char}</span>
                <span className="candidate-rank">#{i + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("canvas.emptyState")}</div>
        )}
      </div>
    </div>
  );
};
