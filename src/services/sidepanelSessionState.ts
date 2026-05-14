export type SidepanelSessionRefreshMode = "auto" | "manual";

export type SidepanelHistoryCoverageState = "unknown" | "available" | "partial";

export type SidepanelSessionState =
  | {
      kind: "entry";
      historyCoverage: "unknown";
    }
  | {
      kind: "idle";
      historyCoverage: "unknown";
    }
  | {
      kind: "restored";
      conversationId: string;
      historyCoverage: "unknown";
    }
  | {
      kind: "partial-history";
      conversationId: string;
      historyCoverage: "partial";
      mode: SidepanelSessionRefreshMode;
    }
  | {
      kind: "rebound";
      conversationId: string;
      historyCoverage: "available";
      mode: SidepanelSessionRefreshMode;
    }
  | {
      kind: "refreshed";
      conversationId: string;
      historyCoverage: "available";
      mode: SidepanelSessionRefreshMode;
    };

export function createIdleSidepanelSessionState(): SidepanelSessionState {
  return {
    kind: "idle",
    historyCoverage: "unknown"
  };
}

export function createEntrySidepanelSessionState(): SidepanelSessionState {
  return {
    kind: "entry",
    historyCoverage: "unknown"
  };
}
