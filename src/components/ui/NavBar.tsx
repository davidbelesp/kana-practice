import React from "react";
import { AppShellChrome, type AppShellMode } from "./AppShell";

interface NavBarProps {
  title: string;
  children?: React.ReactNode;
  variant?: AppShellMode;
  backTo?: string;
  backLabel?: string;
}

/** Compatibility adapter for pages that still render chrome separately. */
export const NavBar: React.FC<NavBarProps> = ({ title, children, variant = "app", backTo, backLabel }) => (
  <AppShellChrome title={title} mode={variant} centerSlot={children} backTo={backTo} backLabel={backLabel} />
);
