import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type CommonProps = {
  icon: LucideIcon;
  label: string;
  size?: number;
  className?: string;
  title?: string;
};

type ButtonProps = CommonProps & {
  to?: undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
};

type LinkProps = CommonProps & {
  to: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type Props = ButtonProps | LinkProps;

export const IconButton: React.FC<Props> = (props) => {
  const { icon: Icon, label, size = 22, className = "", title } = props;
  const cls = `btn-icon ${className}`.trim();
  const iconEl = <Icon size={size} strokeWidth={2} aria-hidden="true" />;

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={cls} aria-label={label} title={title ?? label} onClick={props.onClick}>
        {iconEl}
      </Link>
    );
  }

  const { onClick, type = "button" } = props as ButtonProps;
  return (
    <button type={type} className={cls} aria-label={label} title={title ?? label} onClick={onClick}>
      {iconEl}
    </button>
  );
};
