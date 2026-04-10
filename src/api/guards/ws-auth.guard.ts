import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.token as string;

    if (!token) {
      client.disconnect();
      return false;
    }

    // TODO: Validate WebSocket connect token
    return true;
  }
}
