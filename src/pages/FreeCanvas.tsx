import { useState, useRef } from "react";
import { KanaCanvas, type KanaCanvasRef } from "../components/KanaCanvas";
import handwriting from "../utils/handwriting";
import "./FreeCanvas.css";
import { Link } from "react-router-dom";

export const FreeCanvas = () => {
  const canvasRef = useRef<KanaCanvasRef>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);

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

  return (
    <div className="free-canvas-container container">
      <header className="free-header">
        <Link to="/" className="btn-secondary back-btn">
          ← Home
        </Link>
        <h2>Free Practice</h2>
      </header>

      <div className="canvas-area">
        <KanaCanvas
          ref={canvasRef}
          targetChar="" // No target
          isRevealed={false}
          onVerify={() => {}} // Ignore internal scoring
        />

        <button
          className="btn-primary recognize-btn"
          onClick={handleRecognize}
          disabled={isRecognizing}
        >
          {isRecognizing ? "Thinking..." : "Recognize (AI)"}
        </button>
      </div>

      <div className="candidates-list">
        {candidates.length > 0 ? (
          <div className="candidates-grid">
            {candidates.map((char, i) => (
              <div key={i} className="candidate-card">
                <span className="candidate-char">{char}</span>
                <span className="candidate-rank">#{i + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Draw above and click Recognize</div>
        )}
      </div>
    </div>
  );
};
