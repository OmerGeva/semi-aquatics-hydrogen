import {useLocation, useNavigate} from 'react-router';
import {useMemo} from 'react';

type UrlObject = {
  pathname?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
};

type PushTarget = string | UrlObject;

function buildSearch(query: UrlObject['query']) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    params.set(key, String(value));
  });
  const result = params.toString();
  return result ? `?${result}` : '';
}

function buildUrl(target: PushTarget, currentPath: string) {
  if (typeof target === 'string') {
    return target;
  }
  const pathname = target.pathname ?? currentPath;
  return `${pathname}${buildSearch(target.query)}`;
}

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Array.from(params.entries()).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {},
    );
  }, [location.search]);

  return {
    pathname: location.pathname,
    query,
    push: (
      target: PushTarget,
      _as?: string,
      options?: {replace?: boolean; shallow?: boolean},
    ) => {
      const to = buildUrl(target, location.pathname);
      void navigate(to, {replace: options?.replace});
    },
  };
}
