import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'phoking.settings';

export interface Settings {
  locale: 'en' | 'vi';
}

const DEFAULTS: Settings = { locale: 'en' };

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
