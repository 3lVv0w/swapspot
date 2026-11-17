import type { ParkingPreferences } from "./parking";

export type Settings = ParkingPreferences & {
  voiceOut: boolean;
  wakeWord: boolean;
  voiceName: string;
  rate: number;
  muted: boolean;
  lightTheme: boolean;
};

export const SETTINGS_KEY = "swapspot_settings";

export const defaultSettings: Settings = {
  voiceOut: true,
  wakeWord: false,
  voiceName: "",
  rate: 1,
  maxPrice: 100,
  radius: 3,
  needEv: false,
  needDisabled: false,
  needCovered: false,
  muted: false,
  lightTheme: false,
};

export function parseSettings(text: string): Settings {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Stored settings must be an object");
  }
  const data = parsed as Record<string, unknown>;
  const result = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings) as (keyof Settings)[]) {
    const value = data[key];
    if (value === undefined) continue;
    if (typeof value !== typeof defaultSettings[key] || (typeof value === "number" && !Number.isFinite(value))) {
      throw new Error(`Invalid stored setting: ${key}`);
    }
    Object.assign(result, { [key]: value });
  }
  return result;
}
