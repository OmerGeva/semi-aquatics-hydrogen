import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Cms from '../cms';

type UseDropLockOptions = {
  password?: string | null;
  dropDateTime?: string | null;
};

type UseDropLockResult = {
  isDropLocked: boolean;
  isInFuture: boolean;
  loading: boolean;
  error: string | null;
};

export const useDropLock = (options?: UseDropLockOptions): UseDropLockResult => {
  const passwordGuessed = useSelector((state: any) => state.user.passwordGuessed);

  const [fetchedPassword, setFetchedPassword] = useState<string | null>(null);
  const [fetchedDropDateTime, setFetchedDropDateTime] = useState<string | null>(null);
  const [loadingPassword, setLoadingPassword] = useState<boolean>(false);
  const [loadingDrop, setLoadingDrop] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInFuture, setIsInFuture] = useState<boolean>(false);

  // Resolve effective inputs (prefer provided options, otherwise use fetched values)
  const effectivePassword = options && 'password' in options ? options.password : fetchedPassword;
  const effectiveDropDateTime = options && 'dropDateTime' in options ? options.dropDateTime : fetchedDropDateTime;

  // Fetch password if not provided
  useEffect(() => {
    const shouldFetchPassword = !(options && 'password' in options);
    if (!shouldFetchPassword) return;

    let cancelled = false;
    setLoadingPassword(true);
    new Cms()
      .getNextDropPassword()
      .then((res) => {
        if (!cancelled) setFetchedPassword(res.password ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to fetch drop password');
      })
      .finally(() => {
        if (!cancelled) setLoadingPassword(false);
      });
    return () => {
      cancelled = true;
    };
  }, [options]);

  // Fetch drop data (dateTime) if not provided
  useEffect(() => {
    const shouldFetchDrop = !(options && 'dropDateTime' in options);
    if (!shouldFetchDrop) return;

    let cancelled = false;
    setLoadingDrop(true);
    new Cms()
      .getNextDrop()
      .then((res: any) => {
        if (!cancelled) setFetchedDropDateTime(res?.dateTime ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to fetch drop data');
      })
      .finally(() => {
        if (!cancelled) setLoadingDrop(false);
      });
    return () => {
      cancelled = true;
    };
  }, [options]);

  // Compute adjusted date
  const adjustedDropDateTime = useMemo(() => {
    if (!effectiveDropDateTime) return null;
    return new Date(effectiveDropDateTime);
  }, [effectiveDropDateTime]);

  // Adaptive timer to keep isInFuture updated
  useEffect(() => {
    if (!adjustedDropDateTime) return;

    const target = adjustedDropDateTime.getTime();
    const getDelay = (remainingMs: number): number => {
      if (remainingMs > 24 * 60 * 60 * 1000) return 15 * 60 * 1000; // >24h: 15 min
      if (remainingMs > 6 * 60 * 60 * 1000) return 5 * 60 * 1000; // >6h: 5 min
      if (remainingMs > 60 * 60 * 1000) return 60 * 1000; // >1h: 1 min
      if (remainingMs > 10 * 60 * 1000) return 5 * 1000; // >10m: 5 sec
      if (remainingMs > 60 * 1000) return 1 * 1000; // >1m: 1 sec
      return 500; // <=1m: 0.5 sec
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const tick = () => {
      const now = Date.now();
      const remaining = target - now;
      setIsInFuture(remaining > 0);
      if (remaining <= 0) return; // stop scheduling
      timeoutId = setTimeout(tick, getDelay(remaining));
    };

    tick();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [adjustedDropDateTime]);

  const isDropLocked = useMemo(() => {
    return (
      !!isInFuture &&
      effectivePassword !== null &&
      passwordGuessed !== effectivePassword
    );
  }, [isInFuture, effectivePassword, passwordGuessed]);

  return {
    isDropLocked,
    isInFuture,
    loading: loadingPassword || loadingDrop,
    error,
  };
};

