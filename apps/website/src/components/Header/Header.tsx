import type { InlineMode } from "nano-skeleton";

import { createPortal } from "react-dom";

import styles from "#components/Header/Header.module.css";

interface Props {
  onToggleLoading: () => void;
  direction: "ltr" | "rtl";
  onToggleDirection: () => void;
  /** Roundness of the text bars, from 0 (square) to 1 (fully rounded) */
  radius: number;
  onRadiusChange: (radius: number) => void;
  /** Base font size of the cards, in pixels */
  fontSize: number;
  onFontSizeChange: (fontSize: number) => void;
  inlineMode: InlineMode;
  onInlineModeChange: (inlineMode: InlineMode) => void;
}

const INLINE_MODES: readonly InlineMode[] = [
  "lines-bg-per-line",
  "lines-bg-per-block",
  "words-bg-per-line",
  "words-bg-per-block",
];

export function HeaderLeft({
  onToggleLoading,
  direction,
  onToggleDirection,
  radius,
  onRadiusChange,
  fontSize,
  onFontSizeChange,
  inlineMode,
  onInlineModeChange,
}: Readonly<Props>) {
  const container = document.querySelector("#header-left");
  if (!container) {
    throw new Error("Header element #header-left not found");
  }

  return (
    <div className={styles["root"]}>
      {createPortal(
        <>
          <strong>Skeleton demo</strong> |
          <button
            onClick={onToggleLoading}
            className={styles["loading-state-toggler"]}
            type="button"
          >
            Toggle loading state
          </button>
          <button
            onClick={onToggleDirection}
            className={styles["loading-state-toggler"]}
            type="button"
          >
            Direction: {direction.toUpperCase()}
          </button>
          <label className={styles["slider"]}>
            Inline mode:
            <select
              value={inlineMode}
              onChange={(event) => {
                const mode = INLINE_MODES.find(
                  (value) => value === event.currentTarget.value,
                );
                if (mode) {
                  onInlineModeChange(mode);
                }
              }}
            >
              {INLINE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
          <label className={styles["slider"]}>
            Text radius: {Math.round(radius * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={radius}
              onChange={(event) => {
                onRadiusChange(event.currentTarget.valueAsNumber);
              }}
            />
          </label>
          <label className={styles["slider"]}>
            Font size: {fontSize}px
            <input
              type="range"
              min={12}
              max={32}
              step={1}
              value={fontSize}
              onChange={(event) => {
                onFontSizeChange(event.currentTarget.valueAsNumber);
              }}
            />
          </label>
        </>,
        container,
      )}
    </div>
  );
}
