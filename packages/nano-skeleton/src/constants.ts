const isDev = import.meta.env.MODE !== "production";

const COMPONENT_NAME = "nano-skeleton" as const;

const PROVIDER_NAME = `${COMPONENT_NAME}-provider` as const;

const { default: CSS_CONTENT } = isDev
  ? // oxlint-disable-next-line node/no-top-level-await -- this is fine for dev mode
    await import("./styles.css?inline")
  : { default: `__CSS_CONTENT__` };

const SKELETON_CONTEXT = Symbol.for(`${COMPONENT_NAME}-context`);

export { COMPONENT_NAME, PROVIDER_NAME, CSS_CONTENT, SKELETON_CONTEXT };
