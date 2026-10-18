export type Unsubscribe = () => void;

/**
 * Called with the current value, and on first call also with an unsubscribe
 * function.
 */
export type LoadingCallback = (
  loading: boolean,
  unsubscribe?: Unsubscribe,
) => void;
