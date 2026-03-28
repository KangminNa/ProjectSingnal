export interface Subscription {
  id: string;
  projectId: string;
  consumerId: string;
  eventPattern: string;
  routingFilterJson?: Record<string, unknown>;
  policyId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}
