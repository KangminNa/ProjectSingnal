export interface PresenceStore {
  setOnline(projectId: string, consumerId: string, sessionId: string): Promise<void>;
  setOffline(projectId: string, consumerId: string, sessionId: string): Promise<void>;
  isOnline(projectId: string, consumerId: string): Promise<boolean>;
}
