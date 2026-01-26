import classNames from "classnames";
import type { KanaChar } from "../data/hiragana";
import "./HiraganaCard.css";

interface HiraganaCardProps {
  kana: KanaChar;
  isSelected: boolean;
  onToggle: (char: string) => void;
  streak?: number;
}

export const HiraganaCard = ({
  kana,
  isSelected,
  onToggle,
  streak,
}: HiraganaCardProps) => {
  if (kana.isEmpty) {
    return <div className="hiragana-card empty" />;
  }

  const isMastered = streak && streak >= 100;

  return (
    <button
      className={classNames("hiragana-card", {
        "is-selected": isSelected,
        "is-mastered": isMastered,
      })}
      onClick={() => onToggle(kana.char)}
      aria-label={`Select ${kana.romaji}`}
      aria-pressed={isSelected}
    >
      <div className="kana-char">{kana.char}</div>
      <div className="kana-romaji">{kana.romaji}</div>
      {streak !== undefined && streak > 0 && (
        <div className="kana-streak">
          {isMastered ? "🏆" : "🔥"} {streak}
        </div>
      )}
    </button>
  );
};
