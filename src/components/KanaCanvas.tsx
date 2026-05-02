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
  clear: () => void;
  getPaths: () => Promise<SketchPath[]>;
}

export const KanaCanvas = forwardRef<KanaCanvasRef, KanaCanvasProps>(
  ({ targetChar, onVerify, isRevealed }, ref) => {
    const { t } = useTranslation();
    const sketchRef = useRef<ReactSketchCanvasRef>(null);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [isPassing, setIsPassing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const targetCharRef = useRef(targetChar);

    useEffect(() => {
      targetCharRef.current = targetChar;
    }, [targetChar]);

    const runOcr = useCallback(async (): Promise<number> => {
      if (!sketchRef.current) return 0;
      setIsProcessing(true);

      const paths = await sketchRef.current.exportPaths();
      if (!paths || paths.length === 0) {
        setIsProcessing(false);
        return 0;
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

      return new Promise<number>((resolve) => {
        handwriting.recognize(
          trace,
          {
            language: "ja",
            numOfReturn: 10,
          },
          (results: string[]) => {
            setIsProcessing(false);

            if (results.includes(targetCharRef.current)) {
              resolve(100);
            } else {
              resolve(0);
            }
          },
          (err: Error) => {
            console.error("OCR Error:", err.message);
            setIsProcessing(false);
            resolve(0);
          },
        );
      });
    }, []);

    const handleClear = useCallback(() => {
      sketchRef.current?.clearCanvas();
      setLastScore(null);
      setIsPassing(false);
    }, []);

    useImperativeHandle(ref, () => ({
      check: async () => {
        const score = await runOcr();
        setLastScore(score);
        setIsPassing(score >= 70);
        onVerify(score);
      },
      clear: handleClear,
      getPaths: async () => {
        const paths = await sketchRef.current?.exportPaths();
        return paths || [];
      },
    }), [runOcr, handleClear, onVerify]);

    const handleStroke = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const score = await runOcr();
        setLastScore(score);
        setIsPassing(score >= 70);
      }, 1000);
    }, [runOcr]);

    const handleClearClick = useCallback(() => {
      handleClear();
    }, [handleClear]);

    return (
      <div className="kana-canvas-container">
        <div className="canvas-wrapper">
          {isRevealed && <div className="ghost-overlay">{targetChar}</div>}

          {isPassing && !isRevealed && (
            <div className="passing-indicator" aria-live="polite">✓</div>
          )}

          {isProcessing && !isPassing && !isRevealed && (
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
            strokeColor="white"
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

          <div className="status-badges" role="status" aria-live="polite">
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
          </div>
        </div>
      </div>
    );
  },
);

KanaCanvas.displayName = "KanaCanvas";
