export interface JobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export interface JobQueue {
  enqueue<T>(queueName: string, job: T, opts?: JobOptions): Promise<void>;
}
