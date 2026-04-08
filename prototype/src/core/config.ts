export type AgentConfig = {
  appName: string;
  currentPhase: string;
  mode: "prototype";
};

export function getConfig(): AgentConfig {
  return {
    appName: "OpenDaoAgent",
    currentPhase: "Phase 1",
    mode: "prototype"
  };
}
