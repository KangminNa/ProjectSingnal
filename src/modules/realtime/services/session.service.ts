import { Injectable, Logger } from '@nestjs/common';

export interface SessionInfo {
  projectId: string;
  consumerId: string;
  socketId: string;
  connectedAt: Date;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessions = new Map<string, SessionInfo>();

  register(socketId: string, projectId: string, consumerId: string): void {
    this.sessions.set(socketId, {
      projectId,
      consumerId,
      socketId,
      connectedAt: new Date(),
    });
    this.logger.debug(`Session registered: ${socketId}`);
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
    return Array.from(this.sessions.values()).filter(s => s.projectId === projectId);
  }

  countByProject(projectId: string): { connected: number } {
    const connected = Array.from(this.sessions.values()).filter(s => s.projectId === projectId).length;
    return { connected };
  }
}
