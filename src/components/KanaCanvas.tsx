import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import handwriting from "../utils/handwriting";
import "./KanaCanvas.css";

interface KanaCanvasProps {
  targetChar: string;
  onVerify: (accuracy: number) => void;
  isRevealed: boolean;
  variant?: "quiz" | "free";
  showFeedback?: boolean;
  autoRecognize?: boolean;
  onRecognized?: (results: string[]) => void;
  onRecognitionStateChange?: (state: "idle" | "recognizing" | "ready" | "error") => void;
  onCleared?: () => void;
}

interface SketchPoint {
  x: number;
  y: number;
}

interface SketchPath {
  paths: SketchPoint[];
}

export interface KanaCanvasRef {
  check: () => void;
  recognize: () => Promise<string[]>;
  clear: () => void;
  getPaths: () => Promise<SketchPath[]>;
}

export const KanaCanvas = forwardRef<KanaCanvasRef, KanaCanvasProps>(
  ({
    targetChar,
    onVerify,
    isRevealed,
    variant = "quiz",
    showFeedback = true,
    autoRecognize = true,
    onRecognized,
    onRecognitionStateChange,
    onCleared,
  }, ref) => {
    const { t } = useTranslation();
    const sketchRef = useRef<ReactSketchCanvasRef>(null);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [isPassing, setIsPassing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const targetCharRef = useRef(targetChar);
    const strokeVersionRef = useRef(0);
    const recognizedStrokeVersionRef = useRef(0);
    const requestVersionRef = useRef(0);

    useEffect(() => {
      targetCharRef.current = targetChar;
    }, [targetChar]);

    const runRecognition = useCallback(async (): Promise<string[]> => {
      if (!sketchRef.current) return [];
      const requestVersion = ++requestVersionRef.current;
      const strokeVersion = strokeVersionRef.current;
      setIsProcessing(true);
      onRecognitionStateChange?.("recognizing");

      const paths = await sketchRef.current.exportPaths();
      if (!paths || paths.length === 0) {
        setIsProcessing(false);
        onRecognitionStateChange?.("ready");
        return [];
      }

      const trace = paths.map((p: SketchPath) => {
        const strokeX: number[] = [];
        const strokeY: number[] = [];
        const strokeT: number[] = [];
        p.paths.forEach((point: SketchPoint) => {
          strokeX.push(point.x);
          strokeY.push(point.y);
          strokeT.push(0);
        });
        return [strokeX, strokeY, strokeT];
      });

      return new Promise<string[]>((resolve) => {
        handwriting.recognize(
          trace,
          {
            language: "ja",
            numOfReturn: 10,
          },
          (results: string[]) => {
            if (requestVersion !== requestVersionRef.current || strokeVersion !== strokeVersionRef.current) {
              resolve([]);
              return;
            }
            setIsProcessing(false);
            onRecognized?.(results);
            onRecognitionStateChange?.("ready");
            resolve(results);
          },
          (err: Error) => {
            if (requestVersion !== requestVersionRef.current || strokeVersion !== strokeVersionRef.current) {
              resolve([]);
              return;
            }
            console.error("OCR Error:", err.message);
            setIsProcessing(false);
            onRecognitionStateChange?.("error");
            resolve([]);
          },
        );
      });
    }, [onRecognized, onRecognitionStateChange]);

    const runOcr = useCallback(async (): Promise<number> => {
      const results = await runRecognition();
      return results.includes(targetCharRef.current) ? 100 : 0;
    }, [runRecognition]);

    const handleClear = useCallback(() => {
      sketchRef.current?.clearCanvas();
      strokeVersionRef.current += 1;
      recognizedStrokeVersionRef.current = strokeVersionRef.current;
      if (timerRef.current) clearTimeout(timerRef.current);
      setLastScore(null);
      setIsPassing(false);
      onRecognized?.([]);
      onRecognitionStateChange?.("ready");
      onCleared?.();
    }, [onCleared, onRecognized, onRecognitionStateChange]);

    useImperativeHandle(ref, () => ({
      check: async () => {
        const score = await runOcr();
        if (showFeedback) {
          setLastScore(score);
          setIsPassing(score >= 70);
        }
        onVerify(score);
      },
      recognize: runRecognition,
      clear: handleClear,
      getPaths: async () => {
        const paths = await sketchRef.current?.exportPaths();
        return paths || [];
      },
    }), [handleClear, onVerify, runOcr, runRecognition, showFeedback]);

    const handleStroke = useCallback(() => {
      strokeVersionRef.current += 1;
      const strokeVersion = strokeVersionRef.current;
      if (!autoRecognize) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (recognizedStrokeVersionRef.current === strokeVersion) return;
        recognizedStrokeVersionRef.current = strokeVersion;
        const results = await runRecognition();
        if (!showFeedback) return;
        const score = results.includes(targetCharRef.current) ? 100 : 0;
        setLastScore(score);
        setIsPassing(score >= 70);
      }, 1000);
    }, [autoRecognize, runRecognition, showFeedback]);

    const handleClearClick = useCallback(() => {
      handleClear();
    }, [handleClear]);

    return (
      <div className={`kana-canvas-container canvas-variant-${variant}`}>
        <div className="canvas-wrapper">
          {isRevealed && <div className="ghost-overlay">{targetChar}</div>}

          {showFeedback && isPassing && !isRevealed && (
            <div className="passing-indicator" aria-live="polite">✓</div>
          )}

          {showFeedback && isProcessing && !isPassing && !isRevealed && (
            <div className="processing-indicator" aria-live="polite">
              <div className="spinner"></div>
            </div>
          )}

          <ReactSketchCanvas
            ref={sketchRef}
            style={{
              border: "none",
              background: "transparent",
            }}
            width="400px"
            height="400px"
            strokeWidth={10}
            strokeColor={variant === "free" ? "#ffffff" : "#1a1a1a"}
            canvasColor="transparent"
            onChange={handleStroke}
          />
        </div>

        <div className="canvas-controls">
          <button
            className="btn-secondary btn-sm"
            onClick={handleClearClick}
            disabled={isRevealed}
            aria-label={t("common.clear")}
          >
            {t("common.clear")}
          </button>

          {showFeedback && <div className="status-badges" role="status" aria-live="polite">
            {lastScore !== null && (
              <div
                className="score-badge"
                style={{
                  background: lastScore > 70 ? "var(--accent-primary)" : "gray",
                }}
              >
                {lastScore > 70 ? t("quiz.actions.verified") : t("quiz.actions.unsure")}
              </div>
            )}
          </div>}
        </div>
      </div>
    );
  },
);

KanaCanvas.displayName = "KanaCanvas";
