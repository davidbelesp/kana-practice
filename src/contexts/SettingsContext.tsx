import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import i18n from "../i18n/config";
import type { QuestionType } from "../types/QuizTypes";

export type Theme = "default" | "blue" | "green" | "orange" | "custom";

export interface CustomThemeColors {
  primary: string;   // hex color
  secondary: string; // hex color
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  mutedText: string;
  border: string;
}

export const ALL_QUESTION_TYPES: QuestionType[] = [
  "single-choice-romaji",
  "single-choice-kana",
  "sequence-order",
  "pair-match",
  "drawing-kana",
  "listening-choice",
];

export interface AppSettings {
  // Quiz
  questionsPerQuiz: 10 | 20 | 30 | 60;
  showRomaji: boolean;
  enabledQuestionTypes: QuestionType[];

  // Appearance
  theme: Theme;
  customTheme: CustomThemeColors;
  animationsEnabled: boolean;

  // Practice
  masteryThreshold: number;
  weakestCharCount: number;

  // Numbers
  numbersMin: number;
  numbersMax: number;

  // General
  language: "en" | "es";
}

export const DEFAULT_SETTINGS: AppSettings = {
  questionsPerQuiz: 20,
  showRomaji: false,
  enabledQuestionTypes: [...ALL_QUESTION_TYPES],
  theme: "default",
  customTheme: {
    primary: "#d7f36b",
    secondary: "#f2a35d",
    background: "#101111",
    surface: "#191b1b",
    surfaceRaised: "#222525",
    text: "#ede8db",
    mutedText: "#8d918b",
    border: "#3a403b",
  },
  animationsEnabled: true,
  masteryThreshold: 100,
  weakestCharCount: 10,
  numbersMin: 1,
  numbersMax: 10000,
  language: (i18n.language?.startsWith("es") ? "es" : "en") as "en" | "es",
};

const STORAGE_KEY = "app_settings";

export const THEME_PALETTES: Record<Exclude<Theme, "custom">, CustomThemeColors> = {
  default: { ...DEFAULT_SETTINGS.customTheme },
  blue: { ...DEFAULT_SETTINGS.customTheme, primary: "#8cc6d9", secondary: "#d7f36b" },
  green: { ...DEFAULT_SETTINGS.customTheme, primary: "#a7d45d", secondary: "#d7f36b" },
  orange: { ...DEFAULT_SETTINGS.customTheme, primary: "#f2a35d", secondary: "#e88982" },
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure enabledQuestionTypes is always a valid non-empty array
      if (!Array.isArray(parsed.enabledQuestionTypes) || parsed.enabledQuestionTypes.length === 0) {
        parsed.enabledQuestionTypes = [...ALL_QUESTION_TYPES];
      }
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        customTheme: { ...DEFAULT_SETTINGS.customTheme, ...(parsed.customTheme ?? {}) },
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

/** Build CSS gradient string from two hex colors */
export function makeGradientFromHex(primary: string, secondary: string) {
  return `linear-gradient(45deg, ${primary}, ${secondary})`;
}

/** Convert a hex color to r, g, b components as a string "r, g, b" */
export function hexToRgbString(hex: string, fallback = "#d7f36b"): string {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : fallback;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#d7f36b";
  return [
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  ];
}

export function getReadableForeground(background: string): string {
  const [r, g, b] = hexToRgb(background).map((channel) => channel / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.58 ? "#151716" : "#ede8db";
}

function applyPalette(palette: CustomThemeColors) {
  const root = document.documentElement;
  root.style.setProperty("--studio-bg", palette.background);
  root.style.setProperty("--studio-panel", palette.surface);
  root.style.setProperty("--studio-panel-raised", palette.surfaceRaised);
  root.style.setProperty("--studio-text", palette.text);
  root.style.setProperty("--studio-muted", palette.mutedText);
  root.style.setProperty("--studio-border", palette.border);
  root.style.setProperty("--accent-primary", palette.primary);
  root.style.setProperty("--accent-secondary", palette.secondary);
  root.style.setProperty("--accent-foreground", getReadableForeground(palette.primary));
  root.style.setProperty("--accent-primary-rgb", hexToRgbString(palette.primary));
  root.style.setProperty("--accent-secondary-rgb", hexToRgbString(palette.secondary));
  root.style.setProperty("--accent-soft", `rgba(${hexToRgbString(palette.primary)}, 0.13)`);
  root.style.setProperty("--paper-bg", palette.background);
  root.style.setProperty("--paper-card", palette.surface);
  root.style.setProperty("--paper-card-hover", palette.surfaceRaised);
  root.style.setProperty("--ink-black", palette.text);
  root.style.setProperty("--ink-soft", palette.text);
  root.style.setProperty("--ink-muted", palette.mutedText);
  root.style.setProperty("--glass-border", `rgba(${hexToRgbString(palette.border)}, 0.72)`);
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Apply theme to document root whenever it changes
  useEffect(() => {
    if (settings.theme === "custom") {
      document.documentElement.setAttribute("data-theme", "custom");
      applyPalette(settings.customTheme);
    } else {
      document.documentElement.setAttribute("data-theme", settings.theme);
      const palette = THEME_PALETTES[settings.theme as Exclude<Theme, "custom">];
      applyPalette(palette);
    }
  }, [settings.theme, settings.customTheme]);

  // Persist all setting changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync i18n language
  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
};
