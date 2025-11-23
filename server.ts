// Virtual entry point for the app
import { storefrontRedirect } from '@shopify/hydrogen';
import { createRequestHandler } from '@shopify/hydrogen/oxygen';
import { createHydrogenRouterContext } from '~/lib/context';
import type { ServerBuild } from 'react-router';

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      // Import server build to access routes and assets
      const serverBuild = (await import(
        'virtual:react-router/server-build'
      )) as ServerBuild;

      /**
       * Create a request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      // @ts-ignore
      if (hydrogenContext.cart.setCartId) {


        // @ts-ignore
        const cartId = hydrogenContext.cart.getCartId();
        if (cartId) {
          // @ts-ignore
          const headers = hydrogenContext.cart.setCartId(cartId);
          headers.forEach((value: string, key: string) => {
            response.headers.append(key, value);
          });
        }
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', { status: 500 });
    }
  },
};
