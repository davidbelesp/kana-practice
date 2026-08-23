import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Info, KeyRound, LockKeyhole, Mail, UserRound } from "lucide-react";
import { AppShell } from "../components/ui/AppShell";
import { useAccount } from "../contexts/AccountContext";
import "./Auth.css";

export const CreateAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { configured, createAccount } = useAccount();
  const [username, setUsername] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteKey, setInviteKey] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError(t("auth.passwordMismatch")); return; }
    setBusy(true);
    const result = await createAccount({ username, recoveryEmail, password, inviteKey });
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    navigate("/settings?tab=account", { replace: true });
  };

  return <AppShell title={t("auth.createTitle")}>
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-intro"><p className="auth-kicker">{t("auth.kicker")}</p><h1>{t("auth.createHeading")}</h1><p>{t("auth.createDescription")}</p></div>
        <section className="auth-card" aria-labelledby="create-account-heading">
          <h2 id="create-account-heading">{t("auth.createTitle")}</h2>
          <p className="auth-card-subtitle">{configured ? t("auth.createSubtitle") : t("auth.notConfigured")}</p>
          <form className="auth-form" onSubmit={(event) => void submit(event)}>
            <label className="auth-field"><span>{t("auth.username")}</span><span className="auth-input-wrap"><UserRound size={15} aria-hidden="true" /><input required minLength={3} maxLength={24} pattern="[-a-z0-9_]{3,24}" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder="kana_student" /></span></label>
            <label className="auth-field"><span>{t("auth.recoveryEmail")}</span><span className="auth-input-wrap"><Mail size={15} aria-hidden="true" /><input required type="email" autoComplete="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} placeholder="you@example.com" /></span></label>
            <label className="auth-field"><span>{t("auth.password")}</span><span className="auth-input-wrap"><LockKeyhole size={15} aria-hidden="true" /><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></span></label>
            <label className="auth-field"><span>{t("auth.confirmPassword")}</span><span className="auth-input-wrap"><LockKeyhole size={15} aria-hidden="true" /><input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></span></label>
            <div className="auth-key-row"><label className="auth-field"><span>{t("auth.inviteKey")}</span><span className="auth-input-wrap"><KeyRound size={15} aria-hidden="true" /><input required type="password" value={inviteKey} onChange={(event) => setInviteKey(event.target.value)} placeholder={t("auth.invitePlaceholder")} /></span></label><button type="button" className="auth-info-button" onClick={() => setShowInfo((value) => !value)} aria-label={t("auth.inviteInfoLabel")} aria-expanded={showInfo}><Info size={16} /></button></div>
            {showInfo && <div className="auth-info-popover" role="status">{t("auth.inviteInfo")}</div>}
            {error && <div className="auth-error" role="alert">{error.startsWith("auth.") ? t(error) : error}</div>}
            <button className="btn-primary auth-submit" type="submit" disabled={busy || !configured}>{busy ? t("auth.working") : <>{t("auth.createAction")} <ArrowRight size={16} /></>}</button>
          </form>
          <p className="auth-footer">{t("auth.haveAccount")} <Link to="/login">{t("auth.loginAction")}</Link></p>
        </section>
      </div>
    </div>
  </AppShell>;
};
