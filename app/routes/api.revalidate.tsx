import type {Route} from './+types/api.revalidate';

const JSON_HEADERS = {'content-type': 'application/json'};

export async function loader() {
  return new Response(JSON.stringify({message: 'Use POST to revalidate.'}), {
    status: 405,
    headers: JSON_HEADERS,
  });
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({message: 'Method not allowed', revalidated: false}),
      {status: 405, headers: JSON_HEADERS},
    );
  }

  const url = new URL(request.url);
  const headerToken = request.headers.get('x-revalidate-token');
  const queryToken = url.searchParams.get('token');
  const providedToken = headerToken ?? queryToken ?? '';
  const envRecord = context.env
    ? (context.env as unknown as Record<string, string | undefined>)
    : undefined;
  const expectedToken =
    envRecord?.PRIVATE_REVALIDATE_TOKEN ??
    import.meta.env.VITE_REVALIDATE_TOKEN ??
    null;

  if (expectedToken && providedToken !== expectedToken) {
    return new Response(
      JSON.stringify({message: 'Invalid token', revalidated: false}),
      {status: 401, headers: JSON_HEADERS},
    );
  }

  return new Response(
    JSON.stringify({
      revalidated: true,
      message:
        'Hydrogen storefronts render on demand; no manual revalidation necessary.',
    }),
    {status: 200, headers: JSON_HEADERS},
  );
}

export default function RevalidateEndpoint() {
  return null;
}
