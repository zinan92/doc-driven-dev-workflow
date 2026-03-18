import { useState, useCallback } from "react";

interface ReplayState {
  readonly selectedStepId: string;
  readonly selectedEventIndex: number | null;
  readonly activeTab: string;
}

export function useReplayState(initialStepId: string) {
  const [state, setState] = useState<ReplayState>({
    selectedStepId: initialStepId,
    selectedEventIndex: null,
    activeTab: "Artifact",
  });

  const selectStep = useCallback((stepId: string) => {
    setState((prev) => ({ ...prev, selectedStepId: stepId }));
  }, []);

  const selectEvent = useCallback((eventIndex: number, stageId: string) => {
    setState((prev) => ({
      ...prev,
      selectedEventIndex: eventIndex,
      selectedStepId: stageId,
    }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  return { ...state, selectStep, selectEvent, setActiveTab };
}
