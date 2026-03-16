import { useMemo } from "react";
import type { KanaChar } from "../data/hiragana";
import type { KanaStat } from "../utils/statsManager";
import { HiraganaCard } from "./HiraganaCard";
import "./HiraganaTable.css";

interface HiraganaTableProps {
  data: KanaChar[];
  selectedChars: string[];
  onToggleChar: (char: string) => void;
  onToggleGroup: (chars: string[], shouldSelect: boolean) => void;
  stats: Record<string, KanaStat>;
  masteredKanas: Record<string, boolean>;
}

export const HiraganaTable = ({
  data,
  selectedChars,
  onToggleChar,
  onToggleGroup,
  stats,
  masteredKanas,
}: HiraganaTableProps) => {
  const gojuon = data.filter((k) => k.type === "gojuon");
  const dakuon = data.filter((k) => k.type === "dakuon");
  const handakuon = data.filter((k) => k.type === "handakuon");

  const selectedSet = useMemo(() => new Set(selectedChars), [selectedChars]);

  const chunkArray = (arr: KanaChar[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const renderGrid = (items: KanaChar[], title?: string) => {
    if (items.length === 0) return null;

    // Chunk items into rows of 5
    const rows = chunkArray(items, 5);

    return (
      <div className="kana-section">
        {title && <h3 className="section-title">{title}</h3>}
        <div className="hiragana-rows">
          {rows.map((row, rowIndex) => {
            // Determine row selection state
            const charsInRow = row.filter((k) => !k.isEmpty).map((k) => k.char);
            const allSelected =
              charsInRow.length > 0 &&
              charsInRow.every((c) => selectedSet.has(c));
            const someSelected = charsInRow.some((c) =>
              selectedSet.has(c),
            );

            return (
              <div className="kana-row" key={rowIndex}>
                <div className="row-selector">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected && !allSelected;
                      }
                    }}
                    onChange={(e) => {
                      onToggleGroup(charsInRow, e.target.checked);
                    }}
                    className="row-checkbox"
                  />
                </div>
                <div className="row-cards">
                  {row.map((kana, idx) => (
                    <HiraganaCard
                      key={`${kana.char}-${rowIndex}-${idx}`}
                      kana={kana}
                      isSelected={selectedSet.has(kana.char)}
                      onToggle={onToggleChar}
                      streak={stats[kana.char]?.streak || 0}
                      isMastered={
                        (stats[kana.char]?.streak || 0) >= 100 ||
                        !!masteredKanas[kana.char]
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="hiragana-table-container">
      {renderGrid(gojuon)}
      {renderGrid(dakuon, "Dakuon (Voiced)")}
      {renderGrid(handakuon, "Handakuon (Semi-voiced)")}
    </div>
  );
};
