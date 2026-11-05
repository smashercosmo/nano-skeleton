import type {
  ReactNode,
  ImgHTMLAttributes,
  VideoHTMLAttributes,
  ReactElement,
} from "react";

import styles from "./Card.module.css";

export interface Props {
  media?:
    | ReactElement<ImgHTMLAttributes<HTMLImageElement>>
    | ReactElement<VideoHTMLAttributes<HTMLVideoElement>>;
  title?: ReactNode;
  description?: ReactNode;
  link?: Readonly<{
    href: string;
    label: ReactNode;
    /** Keeps the link focusable while loading */
    interactive?: boolean;
  }>;
}

export function Card(props: Readonly<Props>) {
  return (
    <article className={styles["card"]}>
      <div className={styles["layout"]}>
        <div className={styles["media"]}>
          <nano-skeleton>
            <>{props.media}</>
          </nano-skeleton>
        </div>
        <nano-skeleton>
          <div className={styles["block"]}></div>
        </nano-skeleton>
        <div className={styles["content"]}>
          {props.title !== undefined && (
            <h2 className={styles["title"]}>
              <nano-skeleton>{props.title}</nano-skeleton>
            </h2>
          )}
          {props.description !== undefined && (
            <p className={styles["description"]}>
              <nano-skeleton>{props.description}</nano-skeleton>
            </p>
          )}
          {props.link && (
            <div>
              <nano-skeleton
                inline
                interactive={props.link.interactive ?? false}
              >
                <a className={styles["link"]} href={props.link.href}>
                  {props.link.label}
                </a>
              </nano-skeleton>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
