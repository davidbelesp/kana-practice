import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { prefetchRoute } from "../../utils/routePrefetch";
import { useAccount } from "../../contexts/AccountContext";
import {
  ArrowLeft,
  BarChart3,
  BookMarked,
  BookOpen,
  Hash,
  Home,
  Layers,
  Menu,
  PenLine,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import "./AppShell.css";
import "./StudioPrimitives.css";

const NAV_LINKS = [
  { to: "/", labelKey: "common.home", Icon: Home },
  { to: "/practice", labelKey: "home.title", Icon: BookOpen },
  { to: "/vocabulary", labelKey: "vocabulary.title", Icon: BookMarked },
  { to: "/kanji", labelKey: "kanji.title", Icon: Layers },
  { to: "/numbers", labelKey: "numbers.title", Icon: Hash },
  { to: "/canvas", labelKey: "canvas.title", Icon: PenLine },
  { to: "/grammar", labelKey: "grammar.title", Icon: Sparkles },
  { to: "/stats", labelKey: "stats.title", Icon: BarChart3 },
] as const;

export type AppShellMode = "app" | "focus";

export interface AppShellProps {
  title: string;
  children: React.ReactNode;
  mode?: AppShellMode;
  centerSlot?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export interface AppShellChromeProps {
  title: string;
  mode?: AppShellMode;
  centerSlot?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

const isRouteActive = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname.startsWith(to);

const Brand = ({ onClick }: { onClick?: () => void }) => (
  <Link to="/" className="global-brand" onClick={onClick} aria-label="Kana Practice home">
    <span className="global-brand-mark">か</span>
    <span><strong>kana</strong><small>practice / studio</small></span>
  </Link>
);

const ShellChrome: React.FC<AppShellChromeProps> = ({
  title,
  mode = "app",
  centerSlot,
  backTo,
  backLabel,
}) => {
  const { t } = useTranslation();
  const { user, username } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const isFocus = mode === "focus";
  const accountLabel = username ?? user?.email ?? t("nav.accountAvatar");
  const accountInitial = (username?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const links = useMemo(() => NAV_LINKS.map(({ to, labelKey, Icon }) => ({
    to, label: t(labelKey), Icon, active: isRouteActive(location.pathname, to),
  })), [location.pathname, t]);

  const sidebarLinks = links.map(({ to, label, Icon, active }) => (
    <Link key={to} to={to} onMouseEnter={() => prefetchRoute(to)} onFocus={() => prefetchRoute(to)} className={`studio-nav-link ${active ? "active" : ""}`}>
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
      {active && <i aria-hidden="true" />}
    </Link>
  ));

  return (
    <>
      {!isFocus && (
        <aside className="global-sidebar" aria-label={t("nav.navigation")}>
          <Brand />
          <div className="global-sidebar-label">{t("nav.space")}</div>
          <nav className="studio-nav">{sidebarLinks}</nav>
          <div className="global-sidebar-spacer" />
          <div className="global-sidebar-note"><Sparkles size={15} /><span>{t("nav.noteLineOne")}<br />{t("nav.noteLineTwo")}</span></div>
          <Link to="/settings" className={`studio-nav-link global-settings ${isRouteActive(location.pathname, "/settings") ? "active" : ""}`}>
            <Settings size={17} strokeWidth={1.8} /><span>{t("common.settings")}</span>
          </Link>
          <div className="global-sidebar-status"><span /> {t("nav.localSynced")}</div>
        </aside>
      )}

      <nav className={`navbar ${isFocus ? "navbar-focus" : ""}`} aria-label={title}>
        {!isFocus && <button className="btn-icon navbar-hamburger" onClick={() => setIsOpen(true)} aria-label={t("nav.openMenu")}><Menu size={19} strokeWidth={1.8} /></button>}
        {isFocus && <Brand />}
        <div className="navbar-context"><span>{isFocus ? "STUDIO / FOCUS" : "STUDIO /"}</span><strong>{title}</strong></div>
        <div className="navbar-center">{centerSlot}</div>
        <div className="navbar-right">
          {(backTo || isFocus) && <button className="btn-secondary navbar-back-btn" onClick={() => backTo ? navigate(backTo) : navigate(-1)} aria-label={backLabel ?? t("common.back")}><ArrowLeft size={16} strokeWidth={1.8} /><span>{backLabel ?? t("common.back")}</span></button>}
          {!isFocus && <>
            {!user ? <div className="navbar-account-guest"><Link to="/create-account" className="btn-primary navbar-account-link" onMouseEnter={() => prefetchRoute("/create-account")} onFocus={() => prefetchRoute("/create-account")}>{t("nav.signIn")}</Link><Link to="/login" className="btn-secondary navbar-account-link" onMouseEnter={() => prefetchRoute("/login")} onFocus={() => prefetchRoute("/login")}>{t("nav.login")}</Link></div> : <Link to="/settings?tab=account" className="account-avatar" aria-label={t("nav.accountAvatar", { username: accountLabel })} title={accountLabel}>{accountInitial}</Link>}
            <Link to="/settings" className="btn-icon" aria-label={t("common.settings")}><Settings size={17} strokeWidth={1.8} /></Link>
          </>}
        </div>
      </nav>

      {!isFocus && (
        <>
          <div className={`navbar-overlay ${isOpen ? "visible" : ""}`} onClick={close} aria-hidden="true" />
          <aside className={`navbar-drawer ${isOpen ? "open" : ""}`} aria-label={t("nav.navigation")} aria-hidden={!isOpen}>
            <div className="drawer-header"><Brand onClick={close} /><button className="btn-icon" onClick={close} aria-label={t("nav.closeMenu")}><X size={19} /></button></div>
            <nav className="drawer-nav">{links.map(({ to, label, Icon, active }) => <Link key={to} to={to} onMouseEnter={() => prefetchRoute(to)} onFocus={() => prefetchRoute(to)} className={`drawer-link ${active ? "active" : ""}`} onClick={close}><Icon size={17} /><span>{label}</span></Link>)}
              <div className="drawer-account-actions">
                {user ? <Link to="/settings?tab=account" className="drawer-account-link" onClick={close}><span className="account-avatar account-avatar-small">{accountInitial}</span><span>{accountLabel}</span></Link> : <><Link to="/create-account" className="drawer-link" onClick={close} onMouseEnter={() => prefetchRoute("/create-account")} onFocus={() => prefetchRoute("/create-account")}>{t("nav.signIn")}</Link><Link to="/login" className="drawer-link" onClick={close} onMouseEnter={() => prefetchRoute("/login")} onFocus={() => prefetchRoute("/login")}>{t("nav.login")}</Link></>}
                <Link to="/settings" className="drawer-link" onClick={close}><Settings size={17} /><span>{t("common.settings")}</span></Link>
              </div>
            </nav>
          </aside>
          <nav className="mobile-dock" aria-label={t("nav.navigation")}>
            {[links[0], links[1], links[2], links[6]].map(({ to, label, Icon, active }) => <Link key={to} to={to} onMouseEnter={() => prefetchRoute(to)} onFocus={() => prefetchRoute(to)} className={active ? "active" : ""}><Icon size={18} /><span>{label}</span></Link>)}
            <button onClick={() => setIsOpen(true)} aria-label={t("nav.openMenu")}><Menu size={18} /><span>{t("nav.more")}</span></button>
          </nav>
        </>
      )}
    </>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ children, className = "", ...chromeProps }) => (
  <div className={`studio-shell studio-shell-${chromeProps.mode ?? "app"} ${className}`}>
    <ShellChrome {...chromeProps} />
    <main className="studio-main">{children}</main>
  </div>
);

export const AppShellChrome: React.FC<AppShellChromeProps> = (props) => <ShellChrome {...props} />;
