export interface RealtimeEvent {
  eventType: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface RealtimeGateway {
  publishToUser(projectId: string, userId: string, event: RealtimeEvent): Promise<void>;
  publishToTopic(projectId: string, topic: string, event: RealtimeEvent): Promise<void>;
  publishToChannel(projectId: string, channelId: string, event: RealtimeEvent): Promise<void>;
}
  