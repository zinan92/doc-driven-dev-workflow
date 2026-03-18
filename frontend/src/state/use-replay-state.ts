import { useState, useCallback, useEffect } from "react";

interface ReplayState {
  readonly selectedStepId: string;
  readonly activeTab: string;
}

export function useReplayState(initialStepId: string) {
  const [state, setState] = useState<ReplayState>({
    selectedStepId: initialStepId,
    activeTab: "Artifact",
  });

  useEffect(() => {
    setState({
      selectedStepId: initialStepId,
      activeTab: "Artifact",
    });
  }, [initialStepId]);

  const selectStep = useCallback((stepId: string) => {
    setState((prev) => ({ ...prev, selectedStepId: stepId }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  return { ...state, selectStep, setActiveTab };
}
