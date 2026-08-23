import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useSettings,
  DEFAULT_SETTINGS,
  ALL_QUESTION_TYPES,
  makeGradientFromHex,
  type AppSettings,
  type CustomThemeColors,
} from "../contexts/SettingsContext";
import type { QuestionType } from "../types/QuizTypes";
import { AppShell } from "../components/ui/AppShell";
import { ClipboardList, Palette, Zap, Settings as SettingsIcon, UserRound, type LucideIcon } from "lucide-react";
import { useAccount } from "../contexts/AccountContext";
import "./Settings.css";

type TabId = "quiz" | "appearance" | "practice" | "general" | "account";

interface Tab {
  id: TabId;
  labelKey: string;
  Icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: "quiz", labelKey: "settings.tabs.quiz", Icon: ClipboardList },
  { id: "appearance", labelKey: "settings.tabs.appearance", Icon: Palette },
  { id: "practice", labelKey: "settings.tabs.practice", Icon: Zap },
  { id: "general", labelKey: "settings.tabs.general", Icon: SettingsIcon },
  { id: "account", labelKey: "settings.tabs.account", Icon: UserRound },
];

const THEME_OPTIONS: { id: AppSettings["theme"]; labelKey: string; gradient: string }[] = [
  { id: "default", labelKey: "settings.appearance.default", gradient: "linear-gradient(135deg, #d7f36b, #f2a35d)" },
  { id: "blue", labelKey: "settings.appearance.blue", gradient: "linear-gradient(135deg, #8cc6d9, #d7f36b)" },
  { id: "green", labelKey: "settings.appearance.green", gradient: "linear-gradient(135deg, #a7d45d, #d7f36b)" },
  { id: "orange", labelKey: "settings.appearance.orange", gradient: "linear-gradient(135deg, #f2a35d, #e88982)" },
];

const PALETTE_FIELDS: Array<{ key: keyof CustomThemeColors; labelKey: string; descriptionKey: string }> = [
  { key: "primary", labelKey: "settings.appearance.primary", descriptionKey: "settings.appearance.primaryDesc" },
  { key: "secondary", labelKey: "settings.appearance.secondary", descriptionKey: "settings.appearance.secondaryDesc" },
  { key: "background", labelKey: "settings.appearance.background", descriptionKey: "settings.appearance.backgroundDesc" },
  { key: "surface", labelKey: "settings.appearance.surface", descriptionKey: "settings.appearance.surfaceDesc" },
  { key: "surfaceRaised", labelKey: "settings.appearance.surfaceRaised", descriptionKey: "settings.appearance.surfaceRaisedDesc" },
  { key: "text", labelKey: "settings.appearance.text", descriptionKey: "settings.appearance.textDesc" },
  { key: "mutedText", labelKey: "settings.appearance.mutedText", descriptionKey: "settings.appearance.mutedTextDesc" },
  { key: "border", labelKey: "settings.appearance.border", descriptionKey: "settings.appearance.borderDesc" },
];


const QUESTION_COUNT_OPTIONS: AppSettings["questionsPerQuiz"][] = [10, 20, 30, 60];

export const Settings = () => {
  const { t } = useTranslation();

  const { settings, updateSetting, resetSettings } = useSettings();
  const { configured, user, username, syncStatus, lastSyncedAt, error: accountError, signOut, syncNow, exportAccountData, deleteCloudAccount } = useAccount();
  const [activeTab, setActiveTab] = useState<TabId>("quiz");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab") === "account") setActiveTab("account");
  }, [searchParams]);

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

  /*  Question type helpers  */
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

  /*  Custom theme helpers  */
  const updateCustomColor = (key: keyof CustomThemeColors, hex: string) => {
    updateSetting("customTheme", { ...settings.customTheme, [key]: hex });
    // Auto-switch to custom theme when user edits colors
    if (settings.theme !== "custom") {
      updateSetting("theme", "custom");
    }
  };

  return (
    <AppShell title={t("common.settings")}>
      <div className="settings-page">
      <header className="settings-header">
        <h1>{t("common.settings")}</h1>
      </header>

      <div className="settings-layout">
        {/*  Sidebar 20%  */}
        <nav className="settings-sidebar glass-panel">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.Icon size={16} strokeWidth={2} className="tab-icon" />
              <span className="tab-label">{t(tab.labelKey)}</span>
            </button>
          ))}
        </nav>

        {/*  Content 80%  */}
        <main className="settings-content glass-panel">

          {/*  Quiz Tab  */}
          {activeTab === "quiz" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>{t("settings.quiz.title")}</h2>
                <button
                  className="btn-text reset-btn"
                  onClick={() => {
                    updateSetting("questionsPerQuiz", DEFAULT_SETTINGS.questionsPerQuiz);
                    updateSetting("showRomaji", DEFAULT_SETTINGS.showRomaji);
                    updateSetting("enabledQuestionTypes", DEFAULT_SETTINGS.enabledQuestionTypes);
                    updateSetting("numbersMin", DEFAULT_SETTINGS.numbersMin);
                    updateSetting("numbersMax", DEFAULT_SETTINGS.numbersMax);
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

              {/* Number Range */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">{t("settings.quiz.numbersRange")}</span>
                  <span className="setting-desc">{t("settings.quiz.numbersRangeDesc")}</span>
                </div>
                <div className="setting-control numbers-range-control">
                  <label className="range-label">{t("settings.quiz.numbersMin")}</label>
                  <input
                    type="number"
                    min={1}
                    max={settings.numbersMax - 1}
                    value={settings.numbersMin}
                    onChange={e => {
                      const v = Math.max(1, Math.min(Number(e.target.value), settings.numbersMax - 1));
                      updateSetting("numbersMin", v);
                    }}
                    className="numbers-range-input"
                  />
                  <span className="range-separator">–</span>
                  <label className="range-label">{t("settings.quiz.numbersMax")}</label>
                  <input
                    type="number"
                    min={settings.numbersMin + 1}
                    max={1000000}
                    value={settings.numbersMax}
                    onChange={e => {
                      const v = Math.min(1000000, Math.max(Number(e.target.value), settings.numbersMin + 1));
                      updateSetting("numbersMax", v);
                    }}
                    className="numbers-range-input"
                  />
                </div>
              </div>
            </section>
          )}

          {/*  Appearance Tab  */}
          {activeTab === "appearance" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>{t("settings.appearance.title")}</h2>
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
                  <div>
                    <span className="cte-title">{t("settings.appearance.customColors")}</span>
                    <p>{t("settings.appearance.customColorsDesc")}</p>
                  </div>
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
                <div className="palette-editor-grid">
                  {PALETTE_FIELDS.map(({ key, labelKey, descriptionKey }) => (
                    <label className="palette-field" key={key}>
                      <span className="palette-field-heading">
                        <span className="color-dot" style={{ background: settings.customTheme[key] }} />
                        <span>
                          <strong>{t(labelKey)}</strong>
                          <small>{t(descriptionKey)}</small>
                        </span>
                      </span>
                      <span className="color-picker-wrapper">
                        <input
                          type="color"
                          value={settings.customTheme[key]}
                          onChange={(e) => updateCustomColor(key, e.target.value)}
                          className="color-input"
                          aria-label={t(labelKey)}
                        />
                        <span className="color-hex">{settings.customTheme[key].toUpperCase()}</span>
                      </span>
                    </label>
                  ))}
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

          {/*  Practice Tab  */}
          {activeTab === "practice" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>{t("settings.practice.title")}</h2>
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
          {/*  General Tab  */}
          {activeTab === "general" && (
            <section className="settings-section">
              <div className="section-title-row">
                <h2>{t("settings.tabs.general")}</h2>
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
          {activeTab === "account" && (
            <section className="settings-section account-settings-section">
              <div className="section-title-row"><h2>{t("settings.account.title")}</h2></div>
              <p className="setting-desc account-intro">{t("settings.account.description")}</p>
              {!configured ? <div className="account-notice">{t("settings.account.notConfigured")}</div> : user ? <>
                <div className="account-profile-card"><div><span className="setting-label">{t("settings.account.signedInAs")}</span><strong>{username ?? user.email}</strong><small>{user.email}</small></div><span className={`account-sync-status ${syncStatus}`}>{t(`settings.account.sync.${syncStatus}`)}</span></div>
                {lastSyncedAt && <p className="setting-desc">{t("settings.account.lastSynced", { date: new Date(lastSyncedAt).toLocaleString() })}</p>}
                {accountError && <div className="account-error">{accountError}</div>}
                <div className="account-actions"><button className="btn-primary" onClick={() => void syncNow()} disabled={syncStatus === "syncing"}>{t("settings.account.syncNow")}</button><button className="btn-secondary" onClick={exportAccountData}>{t("settings.account.export")}</button><button className="btn-text" onClick={() => void signOut()}>{t("settings.account.signOut")}</button></div>
                <div className="setting-row setting-row--danger"><div className="setting-info"><span className="setting-label">{t("settings.account.deleteTitle")}</span><span className="setting-desc">{t("settings.account.deleteDescription")}</span></div><div className="setting-control"><button className="btn-secondary" onClick={() => { if (window.confirm(t("settings.account.deleteConfirm"))) void deleteCloudAccount(); }}>{t("settings.account.deleteButton")}</button></div></div>
              </> : <>
                <div className="account-notice">{t("settings.account.guestDescription")}</div>
                <div className="account-actions"><Link className="btn-primary" to="/create-account">{t("auth.createAction")}</Link><Link className="btn-secondary" to="/login">{t("auth.loginAction")}</Link><button className="btn-text" onClick={exportAccountData}>{t("settings.account.exportGuest")}</button></div>
              </>}
            </section>
          )}
        </main>
      </div>
      </div>
    </AppShell>
  );
};
