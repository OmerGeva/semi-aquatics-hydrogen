import { useEffect, useState } from 'react';
import { useMobileContext } from '~/contexts/mobile-context';

export function useIsMobile() {
    const { isMobileInitial } = useMobileContext();

    // Initialize with server-detected mobile value
    const [isMobile, setIsMobile] = useState(isMobileInitial);

    useEffect(() => {
      // After hydration, check actual window size and update if needed
      function updateSize() {
        const newIsMobile = window.innerWidth < 720;
        setIsMobile(newIsMobile);
      }

      // Listen for resize changes
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }, []);

    return isMobile;
  }
