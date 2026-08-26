import type { FocusEvent, PointerEvent } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { prefetchRoute } from "../../utils/routeRegistry";

export const PrefetchLink = ({ onFocus, onPointerDown, onPointerEnter, to, ...props }: LinkProps) => {
  const path = typeof to === "string" ? to : to.pathname ?? "";
  const warm = () => { void prefetchRoute(path); };

  return (
    <Link
      {...props}
      to={to}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => { warm(); onFocus?.(event); }}
      onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => { warm(); onPointerEnter?.(event); }}
      onPointerDown={(event: PointerEvent<HTMLAnchorElement>) => { warm(); onPointerDown?.(event); }}
    />
  );
};
