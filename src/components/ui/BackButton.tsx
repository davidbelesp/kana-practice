import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  to?: string;
  className?: string;
  label?: string;
};

export const BackButton: React.FC<Props> = ({ to, className = "", label }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const text = label ?? t("common.back");

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      className={`btn-secondary back-btn ${className}`.trim()}
      onClick={handleClick}
      aria-label={text}
    >
      <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
      <span>{text}</span>
    </button>
  );
};
