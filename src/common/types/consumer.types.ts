export enum ConsumerType {
  WEBSOCKET = 'WEBSOCKET',
  WEBHOOK = 'WEBHOOK',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
}

export interface ConsumerTarget {
  consumerId: string;
  consumerType: ConsumerType;
  endpoint?: string;
  subscriptionId: string;
  policyId?: string;
}
