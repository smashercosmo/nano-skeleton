import type { Skeleton, SkeletonProvider } from "#root/index.js";

import {
  Skeleton as SkeletonElement,
  SkeletonProvider as SkeletonProviderElement,
} from "#root/index.js";

type Root = Document | ShadowRoot;

/** Waits for fonts and two frames, so styles, fonts and layout are settled */
async function settle() {
  await document.fonts.ready;
  // oxlint-disable-next-line promise/avoid-new -- requestAnimationFrame has no promise-based API
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/** Registers both elements. Safe to call more than once */
function defineElements() {
  SkeletonProviderElement.define();
  SkeletonElement.define();
}

/** Registers the elements and renders the markup into a fresh container */
async function render(html: string) {
  defineElements();
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.replaceChildren(container);
  await settle();
}

function fail(selector: string): never {
  throw new Error(`No element matches "${selector}"`);
}

function get(selector: string, root: Root = document) {
  return root.querySelector<HTMLElement>(selector) ?? fail(selector);
}

function getSkeleton(selector = "nano-skeleton", root: Root = document) {
  return root.querySelector<Skeleton>(selector) ?? fail(selector);
}

function getProvider(
  selector = "nano-skeleton-provider",
  root: Root = document,
) {
  return root.querySelector<SkeletonProvider>(selector) ?? fail(selector);
}

/** The document of the first iframe */
function frameDocument() {
  return (
    document.querySelector<HTMLIFrameElement>("iframe")?.contentDocument ??
    fail("iframe")
  );
}

/** Sets the loading state of the first provider and waits for it to apply */
async function setLoading(loading: boolean, root: Root = document) {
  getProvider("nano-skeleton-provider", root).loading = loading;
  await settle();
}

/** Measures an element's box while loaded and while loading */
async function measureWhileLoading(selector: string, root: Root = document) {
  const element = get(selector, root);
  await setLoading(false, root);
  const loaded = element.getBoundingClientRect();
  await setLoading(true, root);
  const loading = element.getBoundingClientRect();
  return { loaded, loading };
}

/** Computed style of an element or one of its pseudo-elements */
function style(
  selector: string,
  pseudoElement?: string,
  root: Root = document,
) {
  return getComputedStyle(get(selector, root), pseudoElement);
}

/** Names of the properties animated by an element's first animation */
function animatedProperties(selector: string) {
  const [animation] = get(selector).getAnimations();
  const effect = animation?.effect;
  if (!(effect instanceof KeyframeEffect)) {
    return [];
  }
  return effect
    .getKeyframes()
    .flatMap((keyframe) =>
      Object.keys(keyframe).filter(
        (key) =>
          !["offset", "computedOffset", "easing", "composite"].includes(key),
      ),
    );
}

/**
 * The used box-decoration-break value. Safari only supports the prefixed
 * property.
 */
function boxDecorationBreak(selector: string) {
  const computed = style(selector);
  return (
    computed.getPropertyValue("box-decoration-break") ||
    computed.getPropertyValue("-webkit-box-decoration-break")
  );
}

export {
  settle,
  defineElements,
  render,
  get,
  getSkeleton,
  getProvider,
  frameDocument,
  setLoading,
  measureWhileLoading,
  style,
  animatedProperties,
  boxDecorationBreak,
};
