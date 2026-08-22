import { useEffect, useState } from "react";

export function useAsyncResource<T>(load: () => Promise<T>, dependencies: readonly unknown[], enabled = true) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<unknown>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // The caller explicitly declares the values that make its resource stale.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadVersion, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    reload: () => setReloadVersion((version) => version + 1),
  };
}
