import { Injectable, Inject } from '@nestjs/common';
import { PRESENCE_STORE } from '@common/constants/injection-tokens';
import { PresenceStore } from '@domain/ports/outbound/presence-store.port';

@Injectable()
export class PresenceService {
  constructor(@Inject(PRESENCE_STORE) private readonly presenceStore: PresenceStore) {}

  async markOnline(projectId: string, consumerId: string, sessionId: string): Promise<void> {
    await this.presenceStore.setOnline(projectId, consumerId, sessionId);
  }

  async markOffline(projectId: string, consumerId: string, sessionId: string): Promise<void> {
    await this.presenceStore.setOffline(projectId, consumerId, sessionId);
  }

  async isOnline(projectId: string, consumerId: string): Promise<boolean> {
    return this.presenceStore.isOnline(projectId, consumerId);
  }
}
