import {useQuery} from '@apollo/client/react';
import { GET_DROP_BY_HANDLE } from '../services/queries/queries';
import { CollectionT } from '../types/products';

export const useDropByHandle = (handle: string) => {
  const { data, loading, error } = useQuery<any>(GET_DROP_BY_HANDLE, {
    variables: { handle },
    skip: !handle,
  });

  const collection: CollectionT | null =
    (data as Record<string, any> | undefined)?.collectionByHandle ?? null;

  const products =
    collection?.products?.edges.map((edge) => edge) ?? [];

  return {
    products,
    loading,
    error,
  };
};
