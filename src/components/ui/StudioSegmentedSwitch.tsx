import React from "react";
import classNames from "classnames";

export interface StudioSegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface StudioSegmentedSwitchProps<T extends string> {
  value: T;
  options: StudioSegmentOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  sliderClassName?: string;
}

export function StudioSegmentedSwitch<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  sliderClassName,
}: StudioSegmentedSwitchProps<T>) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const sliderStyle = options.length > 0
    ? { width: `${100 / options.length}%`, transform: `translateX(${activeIndex * 100}%)` }
    : undefined;

  return (
    <div className={classNames("tab-switch", className)} role="tablist" aria-label={ariaLabel}>
      <div
        className={classNames("tab-slider", sliderClassName)}
        style={sliderStyle}
        aria-hidden="true"
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={classNames("tab-btn", { active: option.value === value })}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
