import { useDropByHandle } from './use-drop-by-handle';

const RECOMMENDED_DROP_HANDLE = '2025-drop-1';

export const useRecommendedProducts = () => {
  return useDropByHandle(RECOMMENDED_DROP_HANDLE);
};
