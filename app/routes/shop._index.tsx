import { useLoaderData } from 'react-router';
import type { Route } from './+types/shop._index';
import DropPage from '~/components/drop-page/drop-page.component';
import { GET_DROP_QUERY, GET_MAIN_LINE_QUERY, GET_ARCHIVE_SALE_QUERY } from '~/services/queries/queries';
import Cms from '~/cms';

export async function loader({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  const [dropResponse, mainLineResponse, archiveSaleResponse, passwordResponse, dropData] =
    await Promise.all([
      storefront.query(GET_DROP_QUERY),
      storefront.query(GET_MAIN_LINE_QUERY),
      storefront.query(GET_ARCHIVE_SALE_QUERY),
      new Cms().getNextDropPassword(),
      new Cms().getNextDrop(),
    ]);

  const dropItems = dropResponse?.collections?.edges?.[0]?.node ?? null;
  const mainLineItems = mainLineResponse?.collection ?? null;
  const archiveSaleItems = archiveSaleResponse?.collection ?? null;

  if (!dropItems || !mainLineItems) {
    throw new Response('Not Found', { status: 404 });
  }

  return {
    dropItems,
    mainLineItems,
    archiveSaleItems,
    password: passwordResponse?.password ?? null,
    dropData: dropData ?? null,
  };
}

export default function ShopRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <DropPage
      dropItems={data.dropItems}
      mainLineItems={data.mainLineItems}
      archiveSaleItems={data.archiveSaleItems}
      password={data.password}
      dropData={data.dropData}
    />
  );
}
