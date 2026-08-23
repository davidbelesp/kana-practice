import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Gauge, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "../ui/AppShell";
import "./QuizWorkspace.css";

interface QuizWorkspaceProps {
  title: string;
  sourceLabel: string;
  sourceDetail?: string;
  questionIndex: number;
  total: number;
  score: number;
  attempts: number;
  remaining?: number;
  children: ReactNode;
  railContent?: ReactNode;
  headerAction?: ReactNode;
  backTo: string;
  backLabel: string;
  className?: string;
}

export const QuizWorkspace = ({
  title,
  sourceLabel,
  sourceDetail,
  questionIndex,
  total,
  score,
  attempts,
  remaining = Math.max(total - attempts, 0),
  children,
  railContent,
  headerAction,
  backTo,
  backLabel,
  className = "",
}: QuizWorkspaceProps) => {
  const { t } = useTranslation();
  const progress = total > 0 ? Math.min((questionIndex / total) * 100, 100) : 0;
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <AppShell title={title} backTo={backTo} backLabel={backLabel} className={`quiz-studio-shell ${className}`}>
      <div className="quiz-workspace-page">
        <header className="quiz-workspace-header">
          <div>
            <span className="quiz-workspace-kicker">{sourceLabel}</span>
            <h1>{title}</h1>
            {sourceDetail && <p>{sourceDetail}</p>}
          </div>
          <div className="quiz-workspace-header-actions">{headerAction}</div>
        </header>

        <div className="quiz-workspace-layout">
          <main className="quiz-workspace-main" aria-live="polite">{children}</main>
          <aside className="quiz-session-rail" aria-label={t("quiz.sessionSummary")}>
            <div className="quiz-rail-progress glass-panel">
              <div className="quiz-rail-eyebrow"><span>{t("quiz.sessionProgress")}</span><strong>{Math.min(questionIndex + 1, total)} / {total}</strong></div>
              <div className="quiz-rail-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
              <div className="quiz-rail-meta"><span>{t("quiz.remaining", { count: remaining })}</span><span>{accuracy}% {t("quiz.accuracy")}</span></div>
            </div>

            <div className="quiz-rail-stats">
              <div className="quiz-rail-stat glass-panel"><CheckCircle2 size={16} /><span>{t("quiz.results.score")}</span><strong>{score}</strong></div>
              <div className="quiz-rail-stat glass-panel"><Target size={16} /><span>{t("quiz.attempts")}</span><strong>{attempts}</strong></div>
              <div className="quiz-rail-stat glass-panel"><Gauge size={16} /><span>{t("quiz.accuracy")}</span><strong>{accuracy}%</strong></div>
            </div>

            {railContent && <div className="quiz-rail-context glass-panel">{railContent}</div>}

            <div className="quiz-rail-tip"><CircleAlert size={15} /><span>{t("quiz.sessionTip")}</span></div>
            <a className="quiz-rail-exit" href={backTo}><ArrowLeft size={15} />{backLabel}</a>
          </aside>
        </div>
      </div>
    </AppShell>
  );
};
