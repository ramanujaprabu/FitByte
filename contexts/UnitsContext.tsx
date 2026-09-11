/**
 * FitByte — Units context.
 *
 * Everything is stored in the database in metric (kg, cm) — this only
 * controls how numbers are *displayed and entered*. See `utils/units.ts`
 * for the conversion/formatting helpers this is meant to be paired with.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Units = 'metric' | 'imperial';

const STORAGE_KEY = '@fitbyte_units';

interface UnitsContextValue {
  units: Units;
  setUnits: (units: Units) => void;
  isLoaded: boolean;
}

const UnitsContext = createContext<UnitsContextValue | undefined>(undefined);

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnitsState] = useState<Units>('metric');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'metric' || stored === 'imperial') setUnitsState(stored);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const setUnits = useCallback((next: Units) => {
    setUnitsState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<UnitsContextValue>(() => ({ units, setUnits, isLoaded }), [units, setUnits, isLoaded]);

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits(): UnitsContextValue {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within a UnitsProvider');
  return ctx;
}
