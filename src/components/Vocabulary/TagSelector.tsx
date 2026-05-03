import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { getCategory } from "../../data/categories";

interface TagSelectorProps {
  tags: string[];
  activeTags: string[];
  onTagToggle: (tag: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = React.memo(({
  tags,
  activeTags,
  onTagToggle
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`tag-filters-wrapper ${expanded ? 'expanded' : 'collapsed'}`}>
      <button
        type="button"
        className="tag-filters-toggle btn-icon"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        title={expanded ? t("kanji.collapse") : t("kanji.expand")}
      >
        <ChevronDown
          size={20}
          className={`tag-filters-toggle-icon ${expanded ? '' : 'collapsed'}`}
        />
      </button>
      <div className="tag-filters">
        {tags.map(tag => {
          const isActive = activeTags.includes(tag);
          const { color } = getCategory(tag);
          return (
            <button
              key={tag}
              className={`tag-filter-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTagToggle(tag)}
              style={{
                '--tag-color': color,
                '--tag-bg': `${color}1a`,
                '--tag-border': `${color}4d`
              } as React.CSSProperties}
            >
              {t(`vocabulary.categories.${tag}`) || tag}
            </button>
          );
        })}
      </div>
    </div>
  );
});

TagSelector.displayName = "TagSelector";
