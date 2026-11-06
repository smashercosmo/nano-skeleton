import type { InlineMode } from "nano-skeleton";

import { Skeleton, SkeletonProvider } from "nano-skeleton";
import { useEffect, useState } from "react";

import previewImage from "#assets/preview.c3b340d3.png";
import { Card } from "#components/Card/Card.js";
import { HeaderLeft } from "#components/Header/Header.js";
import styles from "#root/App.module.css";

Skeleton.define();
SkeletonProvider.define();

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [radius, setRadius] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [inlineMode, setInlineMode] = useState<InlineMode>("lines-bg-per-line");

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--nano-skeleton-inline-border-radius",
      String(radius),
    );
  }, [radius]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--demo-font-size",
      `${fontSize}px`,
    );
  }, [fontSize]);

  return (
    <div>
      <HeaderLeft
        onToggleLoading={() => {
          setIsLoading((currentState) => !currentState);
        }}
        direction={direction}
        onToggleDirection={() => {
          setDirection((currentState) =>
            currentState === "ltr" ? "rtl" : "ltr",
          );
        }}
        radius={radius}
        onRadiusChange={setRadius}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        inlineMode={inlineMode}
        onInlineModeChange={setInlineMode}
      />
      <div className={styles["root"]}>
        <nano-skeleton-provider loading={isLoading}>
          <Card
            inline={inlineMode}
            media={<img width="1600" height="1200" src={previewImage} alt="" />}
            title={
              <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                <br />
                sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </>
            }
            description={
              <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </>
            }
            link={{
              href: "https://github.com/smashercosmo/nano-skeleton",
              label: "Interactive link: focusable while loading",
              interactive: true,
            }}
          />
        </nano-skeleton-provider>
        <nano-skeleton-provider loading={isLoading}>
          <Card
            inline={inlineMode}
            media={
              <video id="video" controls width={400}>
                <source
                  src="https://developer.mozilla.org/shared-assets/videos/flower.webm"
                  type="video/webm"
                />
              </video>
            }
            title={
              <>
                Card instance
                <br />
                width broken or not loaded image
              </>
            }
            description={
              <>
                Lorem ipsum dolor sit amet, <br />
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </>
            }
            link={{
              href: "https://github.com/smashercosmo/nano-skeleton",
              label: "Default link: inert while loading",
            }}
          />
        </nano-skeleton-provider>
      </div>
    </div>
  );
}
