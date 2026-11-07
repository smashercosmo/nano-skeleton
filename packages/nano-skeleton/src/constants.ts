const COMPONENT_NAME = "nano-skeleton" as const;

const PROVIDER_NAME = `${COMPONENT_NAME}-provider` as const;

const SKELETON_CONTEXT = Symbol.for(`${COMPONENT_NAME}-context`);

export { COMPONENT_NAME, PROVIDER_NAME, SKELETON_CONTEXT };
