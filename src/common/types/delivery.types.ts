export type DeliveryChannel = 'realtime' | 'push' | 'webhook' | 'email';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying' | 'dead_lettered';

export interface DeliveryInput {
  eventId: string;
  projectId: string;
  consumerId: string;
  channel: DeliveryChannel;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  channel: DeliveryChannel;
  deliveredAt?: Date;
  error?: string;
}
