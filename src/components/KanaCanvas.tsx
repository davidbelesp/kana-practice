import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
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

export interface KanaCanvasRef {
  check: () => void;
  clear: () => void;
  getPaths: () => Promise<any>;
}

export const KanaCanvas = forwardRef<KanaCanvasRef, KanaCanvasProps>(
  ({ targetChar, onVerify, isRevealed }, ref) => {
    const { t } = useTranslation();
    const sketchRef = useRef<ReactSketchCanvasRef>(null);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [isPassing, setIsPassing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const runOcr = async (): Promise<number> => {
      if (!sketchRef.current) return 0;
      setIsProcessing(true);

      const paths = await sketchRef.current.exportPaths();
      if (!paths || paths.length === 0) {
        setIsProcessing(false);
        return 0;
      }

      const trace = paths.map((p: any) => {
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

      return new Promise<number>((resolve) => {
        handwriting.recognize(
          trace,
          {
            language: "ja",
            numOfReturn: 10,
          },
          (results: string[]) => {
            console.log("Google OCR Candidates:", results);
            setIsProcessing(false);

            if (results.includes(targetChar)) {
              resolve(100);
            } else {
              resolve(0);
            }
          },
          (err: any) => {
            console.error("OCR Error", err);
            setIsProcessing(false);
            resolve(0);
          },
        );
      });
    };

    useImperativeHandle(ref, () => ({
      check: async () => {
        const score = await runOcr();
        setLastScore(score);
        setIsPassing(score >= 70);
        onVerify(score);
      },
      clear: () => {
        sketchRef.current?.clearCanvas();
        setLastScore(null);
        setIsPassing(false);
      },
      getPaths: async () => {
        return sketchRef.current?.exportPaths() || [];
      },
    }));

    const handleStroke = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // 1 second debounce limit
      timerRef.current = setTimeout(async () => {
        const score = await runOcr();
        setLastScore(score);
        setIsPassing(score >= 70);
      }, 1000);
    };

    const handleClear = () => {
      sketchRef.current?.clearCanvas();
      setLastScore(null);
      setIsPassing(false);
    };

    // Auto-clear when target character changes (new question)
    useEffect(() => {
      handleClear();
    }, [targetChar]);

    return (
      <div className="kana-canvas-container">
        <div className="canvas-wrapper">
          {isRevealed && <div className="ghost-overlay">{targetChar}</div>}

          {isPassing && !isRevealed && (
            <div className="passing-indicator">✓</div>
          )}

          {isProcessing && !isPassing && !isRevealed && (
            <div className="processing-indicator">
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
            onClick={handleClear}
            disabled={isRevealed}
          >
            {t("common.clear")}
          </button>

          <div className="status-badges">
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
