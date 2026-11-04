import { createPortal } from "react-dom";

import styles from "#components/Header/Header.module.css";

interface Props {
  onToggleLoading: () => void;
  direction: "ltr" | "rtl";
  onToggleDirection: () => void;
}

export function HeaderLeft({
  onToggleLoading,
  direction,
  onToggleDirection,
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
        </>,
        container,
      )}
    </div>
  );
}
