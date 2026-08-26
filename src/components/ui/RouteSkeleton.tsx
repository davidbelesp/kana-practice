import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { AppShell } from "./AppShell";
import { getRouteDefinition, type RouteSkeletonVariant } from "../../utils/routeRegistry";
import "./RouteSkeleton.css";

const Blocks = ({ count, className = "" }: { count: number; className?: string }) => (
  <>{Array.from({ length: count }, (_, index) => <span className={`route-skeleton-block ${className}`} key={index} />)}</>
);

const SkeletonBody = ({ variant }: { variant: RouteSkeletonVariant }) => {
  if (variant === "workspace") return <div className="route-skeleton-workspace"><section className="route-skeleton-panel route-skeleton-question"><Blocks count={5} /></section><aside className="route-skeleton-rail"><Blocks count={4} className="route-skeleton-panel" /></aside></div>;
  if (variant === "library") return <><div className="route-skeleton-command route-skeleton-panel"><Blocks count={2} /></div><div className="route-skeleton-library"><aside className="route-skeleton-panel route-skeleton-filter"><Blocks count={6} /></aside><section className="route-skeleton-grid"><Blocks count={10} className="route-skeleton-panel route-skeleton-card" /></section></div></>;
  if (variant === "lesson") return <div className="route-skeleton-lesson"><article className="route-skeleton-panel route-skeleton-article"><Blocks count={9} /></article><aside className="route-skeleton-panel route-skeleton-index"><Blocks count={4} /></aside></div>;
  if (variant === "dashboard") return <><div className="route-skeleton-kpis"><Blocks count={4} className="route-skeleton-panel" /></div><div className="route-skeleton-dashboard"><Blocks count={4} className="route-skeleton-panel" /></div></>;
  if (variant === "canvas") return <div className="route-skeleton-canvas"><section className="route-skeleton-panel route-skeleton-drawing" /><aside className="route-skeleton-panel"><Blocks count={5} /></aside></div>;
  if (variant === "form") return <section className="route-skeleton-panel route-skeleton-form"><Blocks count={6} /></section>;
  return <section className="route-skeleton-panel route-skeleton-standard"><Blocks count={7} /></section>;
};

export const RouteSkeleton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const route = getRouteDefinition(location.pathname);
  const title = route ? t(route.titleKey, { defaultValue: t("common.loading") }) : t("common.loading");
  return (
    <AppShell title={title} backTo={route?.backTo}>
      <div className="route-skeleton" aria-busy="true" aria-label={t("loading.page", { title })}>
        <span className="route-skeleton-status" role="status">{t("loading.page", { title })}</span>
        <header className="route-skeleton-hero"><span className="route-skeleton-line route-skeleton-line-short" /><span className="route-skeleton-line route-skeleton-line-title" /><span className="route-skeleton-line" /></header>
        <SkeletonBody variant={route?.skeleton ?? "standard"} />
      </div>
    </AppShell>
  );
};
