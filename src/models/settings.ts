export type PanelMode = "sidepanel";
export type LanguageSetting = "zh" | "en" | "auto";

export type UserSettings = {
  panelMode: PanelMode;
  // Retained for persisted-schema compatibility while Chrome sidePanel owns shell width.
  panelWidth: number;
  language: LanguageSetting;
  autoGenerate: boolean;
  // Retained for persisted-schema compatibility while the in-panel shell no longer exposes collapse rail behavior.
  panelCollapsed: boolean;
  schemaVersion: number;
  updatedAt: string;
};

export function createDefaultSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    panelMode: "sidepanel",
    panelWidth: 720,
    language: "auto",
    autoGenerate: true,
    panelCollapsed: false,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}
