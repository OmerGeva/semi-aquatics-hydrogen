import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import ShowPage from '~/components/show-page/show-page.component';
import {GET_PRODUCT_BY_HANDLE} from '~/services/queries/queries';

export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  const {handle} = params;

  if (!handle) {
    throw new Response('Not Found', {status: 404});
  }

  const data = await storefront.query(GET_PRODUCT_BY_HANDLE, {
    variables: {handle},
  });

  if (!data?.productByHandle) {
    throw new Response('Not Found', {status: 404});
  }

  return {
    product: {
      node: data.productByHandle,
    },
  };
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return {status: 405, body: 'Method not allowed'};
  }

  const {cart} = context;
  let variantId: string;
  let quantity: number;

  const contentType = request.headers.get('Content-Type') || '';

  try {
    if (contentType.includes('application/json')) {
      const json = await request.json();
      variantId = json.variantId as string;
      quantity = parseInt(json.quantity as string) || 1;
    } else {
      const formData = await request.formData();
      variantId = formData.get('variantId') as string;
      quantity = parseInt(formData.get('quantity') as string) || 1;
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return {status: 400, body: 'Invalid request format'};
  }

  if (!variantId) {
    return {status: 400, body: 'Variant ID is required'};
  }

  try {
    await cart.addLines([{
      merchandiseId: variantId,
      quantity,
    }]);

    return {success: true};
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {status: 500, body: 'Failed to add to cart'};
  }
}

export default function ProductHandleRoute() {
  const data = useLoaderData<typeof loader>();
  return <ShowPage product={data.product} />;
}
