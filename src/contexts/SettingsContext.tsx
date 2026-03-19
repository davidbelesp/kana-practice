import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { QuestionType } from "../types/QuizTypes";

export type Theme = "default" | "blue" | "green" | "orange" | "custom";

export interface CustomThemeColors {
  primary: string;   // hex color
  secondary: string; // hex color
}

export const ALL_QUESTION_TYPES: QuestionType[] = [
  "single-choice-romaji",
  "single-choice-kana",
  "sequence-order",
  "pair-match",
  "drawing-kana",
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
}

export const DEFAULT_SETTINGS: AppSettings = {
  questionsPerQuiz: 20,
  showRomaji: false,
  enabledQuestionTypes: [...ALL_QUESTION_TYPES],
  theme: "default",
  customTheme: { primary: "#c85bff", secondary: "#ff4fa6" },
  animationsEnabled: true,
  masteryThreshold: 100,
  weakestCharCount: 10,
};

const STORAGE_KEY = "app_settings";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure enabledQuestionTypes is always a valid non-empty array
      if (!Array.isArray(parsed.enabledQuestionTypes) || parsed.enabledQuestionTypes.length === 0) {
        parsed.enabledQuestionTypes = [...ALL_QUESTION_TYPES];
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
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
export function hexToRgbString(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
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
      const { primary, secondary } = settings.customTheme;
      document.documentElement.style.setProperty(
        "--accent-primary-rgb",
        hexToRgbString(primary),
      );
      document.documentElement.style.setProperty(
        "--accent-secondary-rgb",
        hexToRgbString(secondary),
      );
    } else {
      document.documentElement.setAttribute("data-theme", settings.theme);
      // Clear any inline custom vars when switching back to a preset
      document.documentElement.style.removeProperty("--accent-primary-rgb");
      document.documentElement.style.removeProperty("--accent-secondary-rgb");
    }
  }, [settings.theme, settings.customTheme]);

  // Persist all setting changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
