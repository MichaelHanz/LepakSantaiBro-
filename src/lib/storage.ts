import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TripState } from '../state/tripState';
import { createInitialState } from '../state/tripState';

const STORAGE_KEY = 'santai-lepak-bro/trip-state/v1';

export async function loadTripState(): Promise<TripState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<TripState>;
    const initial = createInitialState();
    return {
      ...initial,
      ...parsed,
      ledger: { ...initial.ledger, ...parsed.ledger },
    };
  } catch {
    return createInitialState();
  }
}

export async function saveTripState(state: TripState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort; the demo keeps working from memory.
  }
}

export async function clearTripState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
