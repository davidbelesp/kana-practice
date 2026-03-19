import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSettings,
  DEFAULT_SETTINGS,
  ALL_QUESTION_TYPES,
  makeGradientFromHex,
  type AppSettings,
} from "../contexts/SettingsContext";
import type { QuestionType } from "../types/QuizTypes";
import "./Settings.css";

type TabId = "quiz" | "appearance" | "practice";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "quiz", label: "Quiz", icon: "📝" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "practice", label: "Practice", icon: "⚡" },
];

const THEME_OPTIONS: { id: AppSettings["theme"]; label: string; gradient: string }[] = [
  { id: "default", label: "Purple", gradient: "linear-gradient(135deg, #c85bff, #ff4fa6)" },
  { id: "blue", label: "Blue", gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
  { id: "green", label: "Green", gradient: "linear-gradient(135deg, #10b981, #84cc16)" },
  { id: "orange", label: "Orange", gradient: "linear-gradient(135deg, #f97316, #eab308)" },
];

const QUESTION_TYPE_META: Record<QuestionType, { label: string; desc: string; emoji: string }> = {
  "single-choice-romaji": {
    label: "Kana → Rōmaji",
    desc: "See a kana character, pick the correct rōmaji reading",
    emoji: "あ→a",
  },
  "single-choice-kana": {
    label: "Rōmaji → Kana",
    desc: "See a rōmaji reading, pick the correct kana character",
    emoji: "a→あ",
  },
  "sequence-order": {
    label: "Sequence Order",
    desc: "See a rōmaji word, arrange individual kana in the right order",
    emoji: "🔀",
  },
  "pair-match": {
    label: "Pair Match",
    desc: "See a rōmaji pair, select the matching kana pair",
    emoji: "🔗",
  },
  "drawing-kana": {
    label: "Draw Kana",
    desc: "See a rōmaji prompt, draw the kana character freehand",
    emoji: "✏️",
  },
};

const QUESTION_COUNT_OPTIONS: AppSettings["questionsPerQuiz"][] = [10, 20, 30, 60];

export const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSetting } = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>("quiz");

  /* ── Question type helpers ── */
  const toggleQuestionType = (type: QuestionType) => {
    const current = settings.enabledQuestionTypes;
    if (current.includes(type)) {
      // Don't allow deselecting the last type
      if (current.length === 1) return;
      updateSetting("enabledQuestionTypes", current.filter((t) => t !== type));
    } else {
      updateSetting("enabledQuestionTypes", [...current, type]);
    }
  };

  /* ── Custom theme helpers ── */
  const updateCustomColor = (key: "primary" | "secondary", hex: string) => {
    updateSetting("customTheme", { ...settings.customTheme, [key]: hex });
    // Auto-switch to custom theme when user edits colors
    if (settings.theme !== "custom") {
      updateSetting("theme", "custom");
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button className="btn-secondary back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>Settings</h1>
      </header>

      <div className="settings-layout">
        {/* ── Sidebar 20% ── */}
        <nav className="settings-sidebar glass-panel">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Content 80% ── */}
        <main className="settings-content glass-panel">

          {/* ── Quiz Tab ── */}
          {activeTab === "quiz" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>📝 Quiz Settings</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("questionsPerQuiz", DEFAULT_SETTINGS.questionsPerQuiz);
                    updateSetting("showRomaji", DEFAULT_SETTINGS.showRomaji);
                    updateSetting("enabledQuestionTypes", DEFAULT_SETTINGS.enabledQuestionTypes);
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Questions per Quiz</span>
                  <span className="setting-desc">How many questions appear in a single quiz session</span>
                </div>
                <div className="setting-control">
                  <div className="chip-group">
                    {QUESTION_COUNT_OPTIONS.map((n) => (
                      <button
                        key={n}
                        className={`chip ${settings.questionsPerQuiz === n ? "active" : ""}`}
                        onClick={() => updateSetting("questionsPerQuiz", n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Show Rōmaji Hint</span>
                  <span className="setting-desc">Display the romanisation below each kana card</span>
                </div>
                <div className="setting-control">
                  <button
                    className={`toggle ${settings.showRomaji ? "on" : ""}`}
                    onClick={() => updateSetting("showRomaji", !settings.showRomaji)}
                    aria-label="Toggle show romaji"
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>

              {/* Question Types */}
              <div className="setting-row setting-row--block">
                <div className="setting-info">
                  <span className="setting-label">Question Types</span>
                  <span className="setting-desc">
                    Choose which question formats appear in your quiz. At least one must be enabled.
                  </span>
                </div>
                <div className="question-types-grid">
                  {ALL_QUESTION_TYPES.map((type) => {
                    const meta = QUESTION_TYPE_META[type];
                    const isEnabled = settings.enabledQuestionTypes.includes(type);
                    const isLast = settings.enabledQuestionTypes.length === 1 && isEnabled;
                    return (
                      <button
                        key={type}
                        className={`question-type-card ${isEnabled ? "active" : ""} ${isLast ? "last-active" : ""}`}
                        onClick={() => toggleQuestionType(type)}
                        title={isLast ? "At least one type must remain enabled" : ""}
                      >
                        <span className="qt-emoji">{meta.emoji}</span>
                        <span className="qt-label">{meta.label}</span>
                        <span className="qt-desc">{meta.desc}</span>
                        <span className={`qt-check ${isEnabled ? "on" : ""}`}>
                          {isEnabled ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── Appearance Tab ── */}
          {activeTab === "appearance" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>🎨 Appearance</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("theme", DEFAULT_SETTINGS.theme);
                    updateSetting("customTheme", DEFAULT_SETTINGS.customTheme);
                    updateSetting("animationsEnabled", DEFAULT_SETTINGS.animationsEnabled);
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Accent Colour</span>
                  <span className="setting-desc">Choose from a preset palette or create your own</span>
                </div>
                <div className="setting-control">
                  <div className="theme-swatches">
                    {THEME_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        className={`theme-swatch ${settings.theme === t.id ? "active" : ""}`}
                        style={{ background: t.gradient }}
                        onClick={() => updateSetting("theme", t.id)}
                        title={t.label}
                        aria-label={`Select ${t.label} theme`}
                      />
                    ))}
                    {/* Custom swatch */}
                    <button
                      className={`theme-swatch theme-swatch--custom ${settings.theme === "custom" ? "active" : ""}`}
                      style={{
                        background: makeGradientFromHex(
                          settings.customTheme.primary,
                          settings.customTheme.secondary,
                        ),
                      }}
                      onClick={() => updateSetting("theme", "custom")}
                      title="Custom"
                      aria-label="Select custom theme"
                    >
                      {settings.theme !== "custom" && <span className="swatch-custom-icon">✏️</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Theme Editor */}
              <div className={`custom-theme-editor ${settings.theme === "custom" ? "visible" : ""}`}>
                <div className="cte-header">
                  <span className="cte-title">Custom Colours</span>
                  <div
                    className="cte-preview"
                    style={{
                      background: makeGradientFromHex(
                        settings.customTheme.primary,
                        settings.customTheme.secondary,
                      ),
                    }}
                  />
                </div>
                <div className="cte-pickers">
                  <label className="color-picker-label">
                    <span className="color-dot" style={{ background: settings.customTheme.primary }} />
                    <span className="color-picker-name">Primary</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={settings.customTheme.primary}
                        onChange={(e) => updateCustomColor("primary", e.target.value)}
                        className="color-input"
                        aria-label="Primary colour"
                      />
                      <span className="color-hex">{settings.customTheme.primary.toUpperCase()}</span>
                    </div>
                  </label>

                  <div className="cte-divider">→</div>

                  <label className="color-picker-label">
                    <span className="color-dot" style={{ background: settings.customTheme.secondary }} />
                    <span className="color-picker-name">Secondary</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={settings.customTheme.secondary}
                        onChange={(e) => updateCustomColor("secondary", e.target.value)}
                        className="color-input"
                        aria-label="Secondary colour"
                      />
                      <span className="color-hex">{settings.customTheme.secondary.toUpperCase()}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Animations</span>
                  <span className="setting-desc">Enable micro-animations and transitions</span>
                </div>
                <div className="setting-control">
                  <button
                    className={`toggle ${settings.animationsEnabled ? "on" : ""}`}
                    onClick={() => updateSetting("animationsEnabled", !settings.animationsEnabled)}
                    aria-label="Toggle animations"
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── Practice Tab ── */}
          {activeTab === "practice" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>⚡ Practice Settings</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("masteryThreshold", DEFAULT_SETTINGS.masteryThreshold);
                    updateSetting("weakestCharCount", DEFAULT_SETTINGS.weakestCharCount);
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Mastery Threshold</span>
                  <span className="setting-desc">
                    Correct-answer streak required to mark a character as mastered
                  </span>
                </div>
                <div className="setting-control setting-control--slider">
                  <input
                    id="mastery-threshold"
                    type="range"
                    min={10}
                    max={200}
                    step={10}
                    value={settings.masteryThreshold}
                    onChange={(e) =>
                      updateSetting("masteryThreshold", Number(e.target.value))
                    }
                    className="range-slider"
                  />
                  <span className="range-value">{settings.masteryThreshold}</span>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Weakest Characters Count</span>
                  <span className="setting-desc">
                    Number of weakest characters selected when using "Weakest N" shortcut
                  </span>
                </div>
                <div className="setting-control setting-control--slider">
                  <input
                    id="weakest-char-count"
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={settings.weakestCharCount}
                    onChange={(e) =>
                      updateSetting("weakestCharCount", Number(e.target.value))
                    }
                    className="range-slider"
                  />
                  <span className="range-value">{settings.weakestCharCount}</span>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
