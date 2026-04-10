export type DeliveryChannel = 'realtime' | 'push' | 'webhook' | 'email';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying' | 'dead_lettered';

export interface DeliveryInput {
  eventId: string;
  projectId: string;
  consumerId: string;
  channel: DeliveryChannel;
  payload: Record<string, unknown>;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  channel: DeliveryChannel;
  deliveredAt?: Date;
  error?: string;
  retryable?: boolean;
  details?: ChannelDeliveryDetails;
}

export type ChannelDeliveryDetails =
  | { type: 'realtime'; room: string }
  | { type: 'webhook'; httpStatus?: number; retryAfter?: number }
  | { type: 'push'; deviceTokenValid?: boolean; provider?: string }
  | { type: 'email'; messageId?: string; provider?: string };
