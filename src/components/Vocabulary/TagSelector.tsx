import React from "react";
import { useTranslation } from "react-i18next";

interface TagSelectorProps {
  tags: string[];
  activeTag: string;
  onTagClick: (tag: string) => void;
  tagColors: Record<string, string>;
}

export const TagSelector: React.FC<TagSelectorProps> = React.memo(({
  tags,
  activeTag,
  onTagClick,
  tagColors
}) => {
  const { t } = useTranslation();

  return (
    <div className="tag-filters">
      {tags.map(tag => (
        <button 
          key={tag} 
          className={`tag-filter-btn ${activeTag.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
          onClick={() => onTagClick(tag)}
          style={{ 
            '--tag-color': tagColors[tag] || tagColors.default,
            '--tag-bg': `${tagColors[tag] || tagColors.default}1a`,
            '--tag-border': `${tagColors[tag] || tagColors.default}4d`
          } as React.CSSProperties}
        >
          {t(`vocabulary.categories.${tag}`) || tag}
        </button>
      ))}
    </div>
  );
});

TagSelector.displayName = "TagSelector";
