import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Menu, X, Home, BookOpen, BookMarked, Layers, Hash, PenLine, BarChart3, ArrowLeft, Settings,
} from "lucide-react";
import "./NavBar.css";

const NAV_LINKS = [
  { to: "/",           labelKey: "common.home",       Icon: Home },
  { to: "/practice",  labelKey: "home.title",         Icon: BookOpen },
  { to: "/vocabulary",labelKey: "vocabulary.title",   Icon: BookMarked },
  { to: "/kanji",     labelKey: "kanji.title",        Icon: Layers },
  { to: "/numbers",   labelKey: "numbers.title",      Icon: Hash },
  { to: "/canvas",    labelKey: "canvas.title",       Icon: PenLine },
  { to: "/stats",     labelKey: "stats.title",        Icon: BarChart3 },
];

interface NavBarProps {
  title: string;
  children?: React.ReactNode;
}

export const NavBar: React.FC<NavBarProps> = ({ title, children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <nav className="navbar" aria-label={title}>
        <button className="btn-icon navbar-hamburger" onClick={open} aria-label={t("nav.openMenu")}>
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="navbar-center">
          {children ?? <span className="navbar-title">{title}</span>}
        </div>

        <div className="navbar-right">
          <button
            className="btn-secondary navbar-back-btn"
            onClick={() => navigate(-1)}
            aria-label={t("common.back")}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>{t("common.back")}</span>
          </button>
          <Link to="/settings" className="btn-icon" aria-label={t("common.settings")}>
            <Settings size={18} strokeWidth={2} />
          </Link>
        </div>
      </nav>

      <div
        className={`navbar-overlay ${isOpen ? "visible" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside className={`navbar-drawer ${isOpen ? "open" : ""}`} aria-label={t("nav.navigation")}>
        <div className="drawer-header">
          <span className="drawer-brand">日本語の Hub</span>
          <button className="btn-icon" onClick={close} aria-label={t("nav.closeMenu")}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="drawer-nav">
          {NAV_LINKS.map(({ to, labelKey, Icon }) => (
            <Link
              key={to}
              to={to}
              className={`drawer-link ${location.pathname === to ? "active" : ""}`}
              onClick={close}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};
