export interface CategoryDef {
  id: string;
  icon: string;
  color: string;
}

const DEFAULT_CATEGORY: CategoryDef = {
  id: "default",
  icon: "📚",
  color: "#94a3b8"
};

export const CATEGORIES: CategoryDef[] = [
  { id: "fruit",    icon: "🍎",  color: "#10b981" },
  { id: "food",     icon: "🍱",  color: "#f59e0b" },
  { id: "animal",   icon: "🐶",  color: "#ef4444" },
  { id: "color",    icon: "🎨",  color: "#3b82f6" },
  { id: "nature",   icon: "🌲",  color: "#22c55e" },
  { id: "travel",   icon: "✈️", color: "#8b5cf6" },
  { id: "human",    icon: "👤",  color: "#f43f5e" },
  { id: "time",     icon: "⏰",  color: "#64748b" },
  { id: "day",      icon: "📅",  color: "#0ea5e9" },
  { id: "people",   icon: "👥",  color: "#ec4899" },
  { id: "pronoun",  icon: "🗣️", color: "#d946ef" },
  { id: "meal",     icon: "🍽️", color: "#fb923c" },
  { id: "drink",    icon: "🥤",  color: "#06b6d4" },
  { id: "number",   icon: "🔢",  color: "#6366f1" },
  { id: "month",    icon: "📆",  color: "#f97316" },
  { id: "calendar", icon: "🗓️", color: "#14b8a6" }
];

const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
);

export function getCategory(id: string): CategoryDef {
  return CATEGORY_MAP[id] ?? { ...DEFAULT_CATEGORY, id };
}
