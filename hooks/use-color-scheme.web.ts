import { useEffect, useState } from 'react';
import { useThemeMode } from '@/contexts/ThemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the
 * client side for web. Respects the user's explicit Light/Dark/System
 * choice once hydrated (see `contexts/ThemeContext.tsx`).
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const { scheme } = useThemeMode();

  return hasHydrated ? scheme : 'light';
}
