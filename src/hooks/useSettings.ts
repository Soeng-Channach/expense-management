import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { updateSettings } from '@/db/repository';
import { DEFAULT_SETTINGS } from '@/db/seed';
import type { Settings } from '@/types';

/**
 * Reactive settings. While the DB loads (or before seeding) we return the
 * defaults so consumers never deal with `undefined`.
 */
export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get(1), [], undefined);

  const value: Settings = settings ?? { id: 1, ...DEFAULT_SETTINGS };
  const loading = settings === undefined;

  return {
    settings: value,
    loading,
    update: updateSettings,
  };
}
