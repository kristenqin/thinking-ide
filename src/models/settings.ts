export type PanelMode = "layout" | "overlay";
export type LanguageSetting = "zh" | "en" | "auto";

export type UserSettings = {
  panelMode: PanelMode;
  panelWidth: number;
  language: LanguageSetting;
  autoGenerate: boolean;
  panelCollapsed: boolean;
  schemaVersion: number;
  updatedAt: string;
};

export function createDefaultSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    panelMode: "layout",
    panelWidth: 720,
    language: "auto",
    autoGenerate: true,
    panelCollapsed: false,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}
