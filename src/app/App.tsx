import { useEffect, useRef, useState } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import { createDefaultSettings } from "../models/settings";
import { createSidepanelSessionController } from "../services/sidepanelSessionController";
import {
  createIdleSidepanelSessionState,
  type SidepanelSessionState
} from "../services/sidepanelSessionState";
import { useThinkingStore } from "../stores/useThinkingStore";

const DEFAULT_SETTINGS = createDefaultSettings();

export function App() {
  const { document, hydrate, getDocument, replaceDocument, setNotice, setStatus } = useThinkingStore();
  const autoGenerate = document?.settings.autoGenerate ?? DEFAULT_SETTINGS.autoGenerate;
  const controllerRef = useRef<ReturnType<typeof createSidepanelSessionController> | null>(null);
  const [sessionState, setSessionState] = useState<SidepanelSessionState>(
    createIdleSidepanelSessionState
  );

  useEffect(() => {
    const controller = createSidepanelSessionController({
      autoGenerate,
      store: {
        hydrate,
        getDocument,
        replaceDocument,
        setNotice,
        setStatus
      },
      onSessionStateChange: setSessionState
    });
    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.dispose();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    };
  }, [getDocument, hydrate, replaceDocument, setNotice, setStatus]);

  useEffect(() => {
    controllerRef.current?.setAutoGenerate(autoGenerate);
  }, [autoGenerate]);

  return (
    <div
      data-thinking-ide-session-state={sessionState.kind}
      data-thinking-ide-history-coverage={sessionState.historyCoverage}
      data-thinking-ide-session-mode={"mode" in sessionState ? sessionState.mode : undefined}
      data-thinking-ide-session-conversation={
        "conversationId" in sessionState ? sessionState.conversationId : undefined
      }
      style={{ height: "100%" }}
    >
      <ThinkingPanel
        onGenerate={() => controllerRef.current?.regenerate("manual") ?? Promise.resolve()}
        onCollapse={() => void controllerRef.current?.closePanel()}
      />
    </div>
  );
}
