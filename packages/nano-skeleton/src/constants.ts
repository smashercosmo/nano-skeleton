const isDev = import.meta.env.MODE !== "production";

export const COMPONENT_NAME = "nano-skeleton" as const;

export const PROVIDER_NAME = `${COMPONENT_NAME}-provider` as const;

const { default: CSS_CONTENT } = isDev
  ? await import("./styles.css?inline")
  : { default: `__CSS_CONTENT__` };

export { CSS_CONTENT };

export const SKELETON_CONTEXT = Symbol.for(`${COMPONENT_NAME}-context`);
