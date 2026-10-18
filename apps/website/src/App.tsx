import { init } from "nano-skeleton";
import { useState } from "react";

import { Card } from "#components/Card/Card.js";
import { HeaderLeft } from "#components/Header/Header.js";
import styles from "#root/App.module.css";

import previewImage from "../assets/preview.c3b340d3.png";

init();

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div>
      <HeaderLeft
        onToggleLoading={() => setIsLoading((currentState) => !currentState)}
      />
      <div className={styles["root"]}>
        <nano-skeleton-provider loading={isLoading}>
          <Card
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
          />
        </nano-skeleton-provider>
        <nano-skeleton-provider loading={isLoading}>
          <Card
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
          />
        </nano-skeleton-provider>
      </div>
    </div>
  );
}
