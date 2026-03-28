import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // TODO: Integrate with OpenTelemetry SDK
    // Will add span creation/propagation when observability module is set up
    return next.handle();
  }
}
