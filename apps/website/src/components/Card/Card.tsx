import {
  type ReactNode,
  type ImgHTMLAttributes,
  type VideoHTMLAttributes,
  type ReactElement,
} from "react";

import styles from "./Card.module.css";

export type Props =
  | {
      media?:
        | ReactElement<ImgHTMLAttributes<HTMLImageElement>>
        | ReactElement<VideoHTMLAttributes<HTMLVideoElement>>;
      title?: ReactNode;
      description?: ReactNode;
    }
  | undefined;

export function Card(props: Props) {
  return (
    <article className={styles["card"]}>
      <div className={styles["layout"]}>
        <div className={styles["media"]}>
          <nano-skeleton>
            <>{props?.media}</>
          </nano-skeleton>
        </div>
        <nano-skeleton>
          <div style={{ width: 100, height: 100, background: "red" }}></div>
        </nano-skeleton>
        <div className={styles["content"]}>
          {props?.title && (
            <h2 className={styles["title"]}>
              <nano-skeleton>{props?.title}</nano-skeleton>
            </h2>
          )}
          {props?.description && (
            <p className={styles["description"]}>
              <nano-skeleton>{props?.description}</nano-skeleton>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
