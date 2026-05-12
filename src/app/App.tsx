import { useEffect, useRef } from "react";
import { ThinkingPanel } from "../components/panel/ThinkingPanel";
import { createDefaultSettings } from "../models/settings";
import { createSidepanelSessionController } from "../services/sidepanelSessionController";
import { useThinkingStore } from "../stores/useThinkingStore";

const DEFAULT_SETTINGS = createDefaultSettings();

export function App() {
  const { document, hydrate, getDocument, replaceDocument, setNotice, setStatus } = useThinkingStore();
  const autoGenerate = document?.settings.autoGenerate ?? DEFAULT_SETTINGS.autoGenerate;
  const controllerRef = useRef<ReturnType<typeof createSidepanelSessionController> | null>(null);

  useEffect(() => {
    const controller = createSidepanelSessionController({
      autoGenerate,
      store: {
        hydrate,
        getDocument,
        replaceDocument,
        setNotice,
        setStatus
      }
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
    <ThinkingPanel
      onGenerate={() => controllerRef.current?.regenerate("manual") ?? Promise.resolve()}
      onCollapse={() => void controllerRef.current?.closePanel()}
    />
  );
}
