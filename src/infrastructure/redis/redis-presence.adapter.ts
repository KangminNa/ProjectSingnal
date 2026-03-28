import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PresenceStore } from '@domain/ports/outbound/presence-store.port';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class RedisPresenceAdapter implements PresenceStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(projectId: string, consumerId: string): string {
    return `presence:${projectId}:${consumerId}`;
  }

  async setOnline(projectId: string, consumerId: string, sessionId: string): Promise<void> {
    await this.redis.set(this.key(projectId, consumerId), sessionId, 'EX', 300);
  }

  async setOffline(projectId: string, consumerId: string): Promise<void> {
    await this.redis.del(this.key(projectId, consumerId));
  }

  async isOnline(projectId: string, consumerId: string): Promise<boolean> {
    const result = await this.redis.exists(this.key(projectId, consumerId));
    return result === 1;
  }
}
