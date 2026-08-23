import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { AppShell } from "../components/ui/AppShell";
import { useAccount } from "../contexts/AccountContext";
import "./Auth.css";

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { configured, login } = useAccount();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await login(username, password);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    navigate("/settings?tab=account", { replace: true });
  };

  return <AppShell title={t("auth.loginTitle")}>
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-intro"><p className="auth-kicker">{t("auth.kicker")}</p><h1>{t("auth.loginHeading")}</h1><p>{t("auth.loginDescription")}</p></div>
        <section className="auth-card" aria-labelledby="login-heading">
          <h2 id="login-heading">{t("auth.loginTitle")}</h2>
          <p className="auth-card-subtitle">{configured ? t("auth.loginSubtitle") : t("auth.notConfigured")}</p>
          <form className="auth-form" onSubmit={(event) => void submit(event)}>
            <label className="auth-field"><span>{t("auth.username")}</span><span className="auth-input-wrap"><UserRound size={15} aria-hidden="true" /><input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} /></span></label>
            <label className="auth-field"><span>{t("auth.password")}</span><span className="auth-input-wrap"><LockKeyhole size={15} aria-hidden="true" /><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></span></label>
            {error && <div className="auth-error" role="alert">{error.startsWith("auth.") ? t(error) : error}</div>}
            <button className="btn-primary auth-submit" type="submit" disabled={busy || !configured}>{busy ? t("auth.working") : <>{t("auth.loginAction")} <ArrowRight size={16} /></>}</button>
          </form>
          <p className="auth-footer">{t("auth.noAccount")} <Link to="/create-account">{t("auth.createAction")}</Link></p>
          <p className="auth-owner-note">{t("auth.passwordRecovery")}</p>
        </section>
      </div>
    </div>
  </AppShell>;
};
