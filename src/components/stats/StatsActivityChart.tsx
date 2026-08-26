import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ActivityPoint { timestamp: number; correct: number; wrong: number; }

const dayLabel = (timestamp: number) => new Date(timestamp).toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

export const StatsActivityChart = ({ activity }: { activity: ActivityPoint[] }) => {
  const { t } = useTranslation();
  if (!activity.length) return <div className="panel-placeholder">{t("stats.noHistory")}</div>;
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={activity} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--studio-border)" strokeDasharray="3 3" /><XAxis dataKey="timestamp" tickFormatter={dayLabel} stroke="var(--studio-muted)" tickLine={false} axisLine={false} /><YAxis stroke="var(--studio-muted)" tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={{ background: "var(--studio-panel-raised)", border: "1px solid var(--studio-border)", borderRadius: "12px", color: "var(--studio-text)" }} labelFormatter={(label) => dayLabel(Number(label))} /><Legend /><Bar dataKey="correct" name={t("stats.chart.correct")} fill="var(--accent-primary)" stackId="answers" radius={[5, 5, 0, 0]} /><Bar dataKey="wrong" name={t("stats.chart.wrong")} fill="var(--accent-secondary)" stackId="answers" /></BarChart></ResponsiveContainer>;
};
