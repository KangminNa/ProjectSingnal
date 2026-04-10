import { Injectable, Logger } from '@nestjs/common';
import { TransportAdapter } from '@core/transport';
import { TransportProtocol } from '@core/enums';
import type { TransportRequest, TransportResponse } from '@core/transport';

const HTTP_TIMEOUT_MS = 10_000;

/**
 * HttpTransportAdapter
 *
 * HTTP POST로 이벤트를 전달하는 어댑터.
 * ConsumerType이 WEBHOOK, PUSH, EMAIL이든 상관없이
 * endpoint가 있으면 동일한 방식으로 HTTP POST를 수행합니다.
 */
@Injectable()
export class HttpTransportAdapter implements TransportAdapter {
  readonly protocol = TransportProtocol.HTTP;

  private readonly logger = new Logger(HttpTransportAdapter.name);

  async send(request: TransportRequest): Promise<TransportResponse> {
    if (!request.endpoint) {
      return this.fail('No endpoint configured', false);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Event-Id': request.eventId,
          'X-Project-Id': request.projectId,
          'X-Consumer-Id': request.consumerId,
        },
        body: JSON.stringify({
          eventId: request.eventId,
          payload: request.payload,
          metadata: request.metadata,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return {
          success: true,
          protocol: TransportProtocol.HTTP,
          deliveredAt: new Date(),
          retryable: false,
          httpStatus: response.status,
        };
      }

      return {
        success: false,
        protocol: TransportProtocol.HTTP,
        error: `HTTP ${response.status} ${response.statusText}`,
        retryable: response.status >= 500 || response.status === 429,
        httpStatus: response.status,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`HTTP delivery failed to ${request.endpoint}: ${message}`);
      return this.fail(message, true);
    }
  }

  private fail(error: string, retryable: boolean): TransportResponse {
    return { success: false, protocol: TransportProtocol.HTTP, error, retryable };
  }
}
