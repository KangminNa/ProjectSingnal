import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

export interface SessionInfo {
  projectId: string;
  consumerId: string;
  socketId: string;
  connectedAt: Date;
}

const MAX_SESSIONS = 100_000;
const CLEANUP_THRESHOLD = 0.9;

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessions = new Map<string, SessionInfo>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.cleanupTimer = setInterval(() => this.enforceCapacity(), 30_000);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.sessions.clear();
  }

  register(socketId: string, projectId: string, consumerId: string): void {
    if (this.sessions.size >= MAX_SESSIONS) {
      this.evictOldest(Math.floor(MAX_SESSIONS * 0.1));
    }
    this.sessions.set(socketId, {
      projectId,
      consumerId,
      socketId,
      connectedAt: new Date(),
    });
    this.logger.debug(`Session registered: ${socketId} (total: ${this.sessions.size})`);
  }

  unregister(socketId: string): SessionInfo | undefined {
    const session = this.sessions.get(socketId);
    this.sessions.delete(socketId);
    return session;
  }

  getSession(socketId: string): SessionInfo | undefined {
    return this.sessions.get(socketId);
  }

  listByProject(projectId: string): SessionInfo[] {
    const result: SessionInfo[] = [];
    for (const session of this.sessions.values()) {
      if (session.projectId === projectId) result.push(session);
    }
    return result;
  }

  countByProject(projectId: string): { connected: number } {
    let connected = 0;
    for (const session of this.sessions.values()) {
      if (session.projectId === projectId) connected++;
    }
    return { connected };
  }

  get size(): number {
    return this.sessions.size;
  }

  private enforceCapacity(): void {
    if (this.sessions.size < MAX_SESSIONS * CLEANUP_THRESHOLD) return;
    const evictCount = Math.floor(this.sessions.size * 0.1);
    this.evictOldest(evictCount);
    this.logger.warn(`Session capacity enforcement: evicted ${evictCount}, remaining: ${this.sessions.size}`);
  }

  private evictOldest(count: number): void {
    const entries = Array.from(this.sessions.entries())
      .sort((a, b) => a[1].connectedAt.getTime() - b[1].connectedAt.getTime());
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.sessions.delete(entries[i][0]);
    }
  }
}
