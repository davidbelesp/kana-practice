import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { AppShell } from "./AppShell";
import { clearRouteLoad, getRouteDefinition } from "../../utils/routeRegistry";
import "./RouteSkeleton.css";

interface BoundaryProps { children: ReactNode; path: string; title: string; retryLabel: string; reloadLabel: string; heading: string; description: string; }

class Boundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Route loading failed", error, info); }
  componentDidUpdate(previous: BoundaryProps) {
    if (previous.path !== this.props.path && this.state.failed) this.setState({ failed: false });
  }
  retry = () => { clearRouteLoad(this.props.path); this.setState({ failed: false }); };
  render() {
    if (!this.state.failed) return this.props.children;
    return <AppShell title={this.props.title}><section className="route-load-error glass-panel" role="alert"><span aria-hidden="true">!</span><h1>{this.props.heading}</h1><p>{this.props.description}</p><div><button type="button" className="btn-primary" onClick={this.retry}>{this.props.retryLabel}</button><button type="button" className="btn-secondary" onClick={() => window.location.reload()}>{this.props.reloadLabel}</button></div></section></AppShell>;
  }
}

export const RouteErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const route = getRouteDefinition(location.pathname);
  const title = route ? t(route.titleKey, { defaultValue: t("common.loading") }) : t("common.loading");
  return <Boundary path={location.pathname} title={title} retryLabel={t("common.retry")} reloadLabel={t("loading.reload")} heading={t("loading.errorTitle")} description={t("loading.errorDescription")}>{children}</Boundary>;
};
