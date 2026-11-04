type Unsubscribe = () => void;

type LoadingCallback = (loading: boolean, unsubscribe?: Unsubscribe) => void;

export type { Unsubscribe, LoadingCallback };
