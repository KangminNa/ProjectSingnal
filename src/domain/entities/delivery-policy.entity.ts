export interface DeliveryPolicy {
  id: string;
  projectId: string;
  name: string;
  realtimeEnabled: boolean;
  pushFallbackEnabled: boolean;
  retryMaxAttempts: number;
  retryBackoffType: 'fixed' | 'exponential';
  retryBackoffValue: number;
  ttlSeconds: number;
  createdAt: Date;
}
