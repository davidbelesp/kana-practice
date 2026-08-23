import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Headphones, Keyboard, ListChecks, RotateCw, SkipForward, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { numberToJapanese, checkNumberAnswer } from "../utils/numberToJapanese";
import { saveNumberResult } from "../utils/statsManager";
import { useSettings } from "../contexts/SettingsContext";
import { useNotification } from "../contexts/NotificationContext";
import { AppShell } from "../components/ui/AppShell";
import { QuizWorkspace } from "../components/quiz/QuizWorkspace";
import "./Numbers.css";

type QuestionMode = "typing" | "multiple-choice" | "listening" | "mixed";
type RoundMode = Exclude<QuestionMode, "mixed">;
type Status = "correct" | "incorrect" | null;

function randomInRange(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateDistractors(correct: number, min: number, max: number): number[] {
  const distractors = new Set<number>();
  const range = Math.max(10, max - min);
  const strategies: Array<() => number> = [
    () => correct + (Math.random() < 0.5 ? 1 : -1) * Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.max(1, correct))))),
    () => correct + (Math.floor(Math.random() * 9) + 1) * Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.max(1, correct))) - 1)),
    () => correct + (Math.floor(Math.random() * Math.max(10, range / 10)) + 1) * (Math.random() < 0.5 ? 1 : -1),
    () => Math.random() < 0.5 ? correct * 2 : Math.max(1, Math.floor(correct / 2)),
  ];
  for (let attempt = 0; distractors.size < 3 && attempt < 80; attempt++) {
    const candidate = Math.round(strategies[Math.floor(Math.random() * strategies.length)]());
    if (candidate !== correct && candidate >= Math.max(1, min) && candidate <= max) distractors.add(candidate);
  }
  let offset = 1;
  while (distractors.size < 3) { const candidate = correct + offset++; if (candidate !== correct && candidate >= 1 && !distractors.has(candidate)) distractors.add(candidate); }
  return Array.from(distractors);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

export const Numbers = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { showNotification } = useNotification();
  const { numbersMin, numbersMax } = settings;
  const [questionMode, setQuestionMode] = useState<QuestionMode | null>(null);
  const [roundMode, setRoundMode] = useState<RoundMode>("typing");
  const [number, setNumber] = useState(() => randomInRange(numbersMin, numbersMax));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const japanese = useMemo(() => numberToJapanese(number), [number]);

  const buildChoices = useCallback((n: number) => shuffle([n, ...generateDistractors(n, numbersMin, numbersMax)]), [numbersMin, numbersMax]);

  const resolveRoundMode = useCallback((mode: QuestionMode): RoundMode => {
    if (mode !== "mixed") return mode;
    const modes: RoundMode[] = ["typing", "multiple-choice", "listening"];
    return modes[Math.floor(Math.random() * modes.length)];
  }, []);

  const startRound = useCallback((mode: QuestionMode) => {
    const resolved = resolveRoundMode(mode);
    const next = randomInRange(numbersMin, numbersMax);
    setRoundMode(resolved);
    setNumber(next);
    setInput("");
    setSelectedChoice(null);
    setStatus(null);
    setChoices(resolved === "typing" ? [] : buildChoices(next));
  }, [buildChoices, numbersMax, numbersMin, resolveRoundMode]);

  useEffect(() => { if (questionMode) startRound(questionMode); }, [questionMode, startRound]);
  useEffect(() => { if (questionMode && status === null && roundMode === "typing") inputRef.current?.focus(); }, [number, questionMode, roundMode, status]);

  const finishAnswer = useCallback((correct: boolean) => {
    setAttempts((value) => value + 1);
    if (correct) setScore((value) => value + 1);
    setStatus(correct ? "correct" : "incorrect");
    saveNumberResult(number, correct);
  }, [number]);

  const handleSubmit = useCallback(() => {
    if (!questionMode) return;
    if (status !== null) { startRound(questionMode); return; }
    if (!input.trim()) return;
    finishAnswer(checkNumberAnswer(number, input));
  }, [finishAnswer, input, number, questionMode, startRound, status]);

  const handleChoiceSelect = useCallback((choice: number) => {
    if (status !== null) return;
    setSelectedChoice(choice);
    finishAnswer(choice === number);
  }, [finishAnswer, number, status]);

  const readAloud = useCallback(() => {
    if (!("speechSynthesis" in window)) { showNotification(t("numbers.audioUnavailable"), "info"); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(japanese.hiragana);
    utterance.lang = "ja-JP";
    utterance.rate = .82;
    window.speechSynthesis.speak(utterance);
  }, [japanese.hiragana, showNotification, t]);

  const modeOptions: Array<{ id: QuestionMode; label: string; Icon: typeof Keyboard }> = [
    { id: "mixed", label: t("numbers.modeMixed"), Icon: RotateCw },
    { id: "typing", label: t("numbers.modeTyping"), Icon: Keyboard },
    { id: "multiple-choice", label: t("numbers.modeChoice"), Icon: ListChecks },
    { id: "listening", label: t("numbers.modeListening"), Icon: Headphones },
  ];

  const activeMode = modeOptions.find(({ id }) => id === questionMode);
  const chooseMode = useCallback((mode: QuestionMode) => {
    setScore(0);
    setAttempts(0);
    setStatus(null);
    setInput("");
    setSelectedChoice(null);
    setQuestionMode(mode);
  }, []);

  if (!questionMode) {
    return (
      <AppShell title={t("numbers.title")}>
        <div className="numbers-home container">
          <header className="numbers-home-header">
            <div>
              <span className="section-kicker">NUMBER LAB / START</span>
              <h1>{t("numbers.homeTitle")}</h1>
              <p>{t("numbers.homeSubtitle")}</p>
            </div>
            <div className="numbers-home-range glass-panel">
              <span>{t("numbers.rangeLabel")}</span>
              <strong>{numbersMin.toLocaleString()}–{numbersMax.toLocaleString()}</strong>
              <small>{t("numbers.rangeHint")}</small>
            </div>
          </header>

          <section className="numbers-mode-grid" aria-label={t("numbers.chooseMode")}>
            {modeOptions.map(({ id, label, Icon }) => (
              <button key={id} className={`numbers-mode-card ${id === "mixed" ? "featured" : ""}`} onClick={() => chooseMode(id)}>
                <span className="numbers-mode-card-icon"><Icon size={22} /></span>
                <span className="numbers-mode-card-copy"><strong>{label}</strong><small>{t(`numbers.mode${id === "mixed" ? "Mixed" : id === "multiple-choice" ? "Choice" : id[0].toUpperCase() + id.slice(1)}Desc`)}</small></span>
                <ArrowRight size={17} className="numbers-mode-card-arrow" />
              </button>
            ))}
          </section>
          <p className="numbers-home-note">{t("numbers.homeNote")}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <QuizWorkspace title={t("numbers.title")} sourceLabel="NUMBER LAB" sourceDetail={t("numbers.subtitle")} questionIndex={attempts} total={Math.max(attempts + 1, 1)} score={score} attempts={attempts} remaining={0} railContent={<><span className="quiz-rail-context-label">{t("numbers.activeMode")}</span><strong className="quiz-rail-context-value">{activeMode?.label}</strong><button className="btn-text numbers-change-mode" onClick={() => setQuestionMode(null)}>{t("numbers.changeMode")}</button><span className="quiz-rail-context-label">{t("numbers.range", { min: numbersMin.toLocaleString(), max: numbersMax.toLocaleString() })}</span></>} backTo="/" backLabel={t("common.back")}>
      <div className="numbers-container numbers-studio-page">
        <div className="numbers-mode-panel glass-panel numbers-inline-mode"><span className="section-kicker">{t("numbers.activeMode")}</span><strong>{activeMode?.label}</strong><button className="btn-text numbers-change-mode" onClick={() => setQuestionMode(null)}>{t("numbers.changeMode")}</button></div>

        <main className="numbers-workspace">
          <div className={classNames("numbers-card glass-panel", status)}>
            <div className="numbers-card-meta"><span>{t("numbers.roundMode", { mode: t(`numbers.mode${roundMode === "multiple-choice" ? "Choice" : roundMode[0].toUpperCase() + roundMode.slice(1)}`) })}</span><span>{t("numbers.range", { min: numbersMin.toLocaleString(), max: numbersMax.toLocaleString() })}</span></div>

            {roundMode === "typing" ? <>
              <div className="numbers-question"><span className="question-type">{t("numbers.prompt")}</span><div className="numbers-display">{number.toLocaleString()}</div></div>
              <input ref={inputRef} className={classNames("numbers-input", status)} type="text" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") handleSubmit(); }} placeholder={t("numbers.placeholder")} disabled={status !== null} autoComplete="off" autoCapitalize="none" />
              <div className="numbers-actions"><button className="btn-primary" onClick={handleSubmit} disabled={status === null && !input.trim()}>{status !== null ? <><ArrowRight size={16} />{t("numbers.next")}</> : <><Check size={16} />{t("quiz.actions.check")}</>}</button>{status === null && <button className="btn-secondary" onClick={() => startRound(questionMode)}><SkipForward size={15} />{t("numbers.skip")}</button>}</div>
            </> : <>
              <div className="numbers-question"><span className="question-type">{roundMode === "listening" ? t("numbers.promptListening") : t("numbers.promptChoice")}</span><div className="numbers-reading">{japanese.romaji}</div><div className="numbers-reading-hiragana">{japanese.hiragana}</div>{roundMode === "listening" && <button className="btn-secondary listen-btn" onClick={readAloud}><Volume2 size={16} />{t("numbers.playAudio")}</button>}</div>
              <div className="numbers-choices">{choices.map((choice) => <button key={choice} className={classNames("numbers-choice-btn", { correct: status !== null && choice === number, incorrect: status !== null && choice !== number, selected: selectedChoice === choice })} onClick={() => handleChoiceSelect(choice)} disabled={status !== null}>{choice.toLocaleString()}</button>)}</div>
              {status !== null && <button className="btn-primary" onClick={() => startRound(questionMode)}><ArrowRight size={16} />{t("numbers.next")}</button>}
            </>}

            <div className="numbers-feedback" aria-live="polite">{status === "correct" && <div className="feedback correct"><Check size={17} />{t("quiz.feedback.correct")}</div>}{status === "incorrect" && <div className="feedback incorrect"><span>{t("quiz.feedback.incorrect")}</span><strong>{japanese.romaji}</strong><small>{japanese.hiragana}</small></div>}</div>
          </div>
        </main>
      </div>
    </QuizWorkspace>
  );
};
