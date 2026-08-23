import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { KanaCanvas, type KanaCanvasRef } from "../components/KanaCanvas";
import "./FreeCanvas.css";
import { useNotification } from "../contexts/NotificationContext";
import { AppShell } from "../components/ui/AppShell";

export const FreeCanvas = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<KanaCanvasRef>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [recognitionState, setRecognitionState] = useState<"idle" | "recognizing" | "ready" | "error">("idle");

  const { showNotification } = useNotification();

  const handleRecognize = () => { void canvasRef.current?.recognize(); };

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
    <AppShell title={t("canvas.title")}>
      <div className="free-canvas-container">

        <div className="canvas-area">
          <KanaCanvas
            ref={canvasRef}
            targetChar="" // No target
            isRevealed={false}
            onVerify={() => { }} // Score scoring ignored
            variant="free"
            showFeedback={false}
            autoRecognize
            onRecognized={setCandidates}
            onRecognitionStateChange={setRecognitionState}
            onCleared={() => setCandidates([])}
          />

          <button
            className="btn-primary recognize-btn"
            onClick={handleRecognize}
            disabled={recognitionState === "recognizing"}
          >
            {recognitionState === "recognizing" ? t("canvas.thinking") : t("canvas.recognize")}
          </button>
          <p className={`recognition-status status-${recognitionState}`} role="status" aria-live="polite">
            {recognitionState === "recognizing" ? t("canvas.liveRecognizing") : recognitionState === "error" ? t("canvas.liveError") : t("canvas.liveReady")}
          </p>
        </div>

        <div className="candidates-list">
          {candidates.length > 0 ? (
            <div className="candidates-grid">
              {candidates.map((char, i) => (
                <button
                  key={i}
                  className="candidate-card"
                  onClick={() => handleCopy(char)}
                  title={t("canvas.copyTitle")}
                >
                  <span className="candidate-char">{char}</span>
                  <span className="candidate-rank">#{i + 1}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">{t("canvas.emptyState")}</div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
