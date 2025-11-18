import {useLoaderData} from 'react-router';
import type {Route} from './+types/shop.$productId';
import ShowPage from '~/components/show-page/show-page.component';
import {GET_PRODUCT_BY_PRODUCT_ID} from '~/services/queries/queries';

export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  const {productId} = params;

  if (!productId) {
    throw new Response('Not Found', {status: 404});
  }

  const data = await storefront.query(GET_PRODUCT_BY_PRODUCT_ID, {
    variables: {
      productId: `gid://shopify/Product/${productId}`,
    },
  });

  if (!data?.node) {
    throw new Response('Not Found', {status: 404});
  }

  return {product: data};
}

export default function ShopProductRoute() {
  const data = useLoaderData<typeof loader>();
  return <ShowPage product={data.product} />;
}
