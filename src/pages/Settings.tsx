import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useSettings,
  DEFAULT_SETTINGS,
  ALL_QUESTION_TYPES,
  makeGradientFromHex,
  type AppSettings,
} from "../contexts/SettingsContext";
import type { QuestionType } from "../types/QuizTypes";
import "./Settings.css";

type TabId = "quiz" | "appearance" | "practice" | "general";

interface Tab {
  id: TabId;
  labelKey: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "quiz", labelKey: "settings.tabs.quiz", icon: "📝" },
  { id: "appearance", labelKey: "settings.tabs.appearance", icon: "🎨" },
  { id: "practice", labelKey: "settings.tabs.practice", icon: "⚡" },
  { id: "general", labelKey: "settings.tabs.general", icon: "⚙️" },
];

const THEME_OPTIONS: { id: AppSettings["theme"]; labelKey: string; gradient: string }[] = [
  { id: "default", labelKey: "settings.appearance.purple", gradient: "linear-gradient(135deg, #c85bff, #ff4fa6)" },
  { id: "blue", labelKey: "settings.appearance.blue", gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
  { id: "green", labelKey: "settings.appearance.green", gradient: "linear-gradient(135deg, #10b981, #84cc16)" },
  { id: "orange", labelKey: "settings.appearance.orange", gradient: "linear-gradient(135deg, #f97316, #eab308)" },
];


const QUESTION_COUNT_OPTIONS: AppSettings["questionsPerQuiz"][] = [10, 20, 30, 60];

export const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>("quiz");

  const QUESTION_TYPE_META: Record<QuestionType, { label: string; desc: string; emoji: string }> = {
    "single-choice-romaji": {
      label: t("settings.quiz.typeLabels.romaji"),
      desc: t("settings.quiz.typeDescs.romaji"),
      emoji: "あ→a",
    },
    "single-choice-kana": {
      label: t("settings.quiz.typeLabels.kana"),
      desc: t("settings.quiz.typeDescs.kana"),
      emoji: "a→あ",
    },
    "sequence-order": {
      label: t("settings.quiz.typeLabels.sequence"),
      desc: t("settings.quiz.typeDescs.sequence"),
      emoji: "🔀",
    },
    "pair-match": {
      label: t("settings.quiz.typeLabels.pair"),
      desc: t("settings.quiz.typeDescs.pair"),
      emoji: "🔗",
    },
    "drawing-kana": {
      label: t("settings.quiz.typeLabels.drawing"),
      desc: t("settings.quiz.typeDescs.drawing"),
      emoji: "✏️",
    },
    "listening-choice": {
      label: t("settings.quiz.typeLabels.listening"),
      desc: t("settings.quiz.typeDescs.listening"),
      emoji: "🎧",
    },
  };

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
          ← {t("common.back")}
        </button>
        <h1>{t("common.settings")}</h1>
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
              <span className="tab-label">{t(tab.labelKey)}</span>
            </button>
          ))}
        </nav>

        {/* ── Content 80% ── */}
        <main className="settings-content glass-panel">

          {/* ── Quiz Tab ── */}
          {activeTab === "quiz" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>📝 {t("settings.quiz.title")}</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("questionsPerQuiz", DEFAULT_SETTINGS.questionsPerQuiz);
                    updateSetting("showRomaji", DEFAULT_SETTINGS.showRomaji);
                    updateSetting("enabledQuestionTypes", DEFAULT_SETTINGS.enabledQuestionTypes);
                  }}
                >
                  {t("common.reset")}
                </button>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">{t("settings.quiz.length")}</span>
                  <span className="setting-desc">{t("settings.quiz.lengthDesc")}</span>
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
                  <span className="setting-label">{t("settings.quiz.hints")}</span>
                  <span className="setting-desc">{t("settings.quiz.hintsDesc")}</span>
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
                  <span className="setting-label">{t("settings.quiz.types")}</span>
                  <span className="setting-desc">
                    {t("settings.quiz.typesDesc")}
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
                        title={isLast ? t("settings.quiz.lastTypeWarning") : ""}
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
                <h2>🎨 {t("settings.appearance.title")}</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("theme", DEFAULT_SETTINGS.theme);
                    updateSetting("customTheme", DEFAULT_SETTINGS.customTheme);
                    updateSetting("animationsEnabled", DEFAULT_SETTINGS.animationsEnabled);
                  }}
                >
                  {t("common.reset")}
                </button>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">{t("settings.appearance.accentColor")}</span>
                  <span className="setting-desc">{t("settings.appearance.accentColorDesc")}</span>
                </div>
                <div className="setting-control">
                  <div className="theme-swatches">
                    {THEME_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`theme-swatch ${settings.theme === option.id ? "active" : ""}`}
                        style={{ background: option.gradient }}
                        onClick={() => updateSetting("theme", option.id)}
                        title={t(option.labelKey)}
                        aria-label={`Select ${t(option.labelKey)} theme`}
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
                      title={t("settings.appearance.customTheme")}
                      aria-label="Select custom theme"
                    >
                      {settings.theme !== "custom" && <span className="swatch-custom-icon">✏️</span>}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`custom-theme-editor ${settings.theme === "custom" ? "visible" : ""}`}>
                <div className="cte-header">
                  <span className="cte-title">{t("settings.appearance.customColors")}</span>
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
                    <span className="color-picker-name">{t("settings.appearance.primary")}</span>
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
                    <span className="color-picker-name">{t("settings.appearance.secondary")}</span>
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
                  <span className="setting-label">{t("settings.appearance.animations")}</span>
                  <span className="setting-desc">{t("settings.appearance.animationsDesc")}</span>
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
                <h2>⚡ {t("settings.practice.title")}</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("masteryThreshold", DEFAULT_SETTINGS.masteryThreshold);
                    updateSetting("weakestCharCount", DEFAULT_SETTINGS.weakestCharCount);
                  }}
                >
                  {t("common.reset")}
                </button>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">{t("settings.practice.masteryThreshold")}</span>
                  <span className="setting-desc">
                    {t("settings.practice.masteryDesc")}
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
                  <span className="setting-label">{t("settings.practice.weakestCount")}</span>
                  <span className="setting-desc">
                    {t("settings.practice.weakestDesc")}
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
          {/* ── General Tab ── */}
          {activeTab === "general" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>⚙️ {t("settings.tabs.general")}</h2>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">{t("settings.general.language")}</span>
                  <span className="setting-desc">{t("settings.general.languageDesc")}</span>
                </div>
                <div className="setting-control">
                  <div className="chip-group">
                    <button
                      className={`chip ${settings.language === "en" ? "active" : ""}`}
                      onClick={() => updateSetting("language", "en")}
                    >
                      English
                    </button>
                    <button
                      className={`chip ${settings.language === "es" ? "active" : ""}`}
                      onClick={() => updateSetting("language", "es")}
                    >
                      Español
                    </button>
                  </div>
                </div>
              </div>

              <div className="setting-row setting-row--danger">
                <div className="setting-info">
                  <span className="setting-label">{t("settings.general.resetTitle")}</span>
                  <span className="setting-desc">{t("settings.general.resetDesc")}</span>
                </div>
                <div className="setting-control">
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      if (window.confirm(t("settings.general.resetConfirm"))) {
                        resetSettings();
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                  >
                    {t("settings.general.resetButton")}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
