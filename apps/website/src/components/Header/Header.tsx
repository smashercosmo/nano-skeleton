import { createPortal } from "react-dom";

import styles from "#components/Header/Header.module.css";

type Props = {
  onToggleLoading: () => void;
};

export function HeaderLeft({ onToggleLoading }: Props) {
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
        </>,
        document.getElementById("header-left")!,
      )}
    </div>
  );
}
