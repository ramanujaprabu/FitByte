import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useThemeMode } from '@/contexts/ThemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the
 * client side for web. Respects the user's explicit Light/Dark/System
 * choice once hydrated (see `contexts/ThemeContext.tsx`).
 */
export function useColorScheme(): 'light' | 'dark' {
=======
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

<<<<<<< HEAD
  const { scheme } = useThemeMode();

  return hasHydrated ? scheme : 'light';
=======
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
}
