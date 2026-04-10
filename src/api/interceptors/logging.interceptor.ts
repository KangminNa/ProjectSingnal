import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      this.logger.debug(`${method} ${url} body type=${typeof body} value=${JSON.stringify(body).substring(0, 200)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.logger.log(`${method} ${url} ${response.statusCode} - ${Date.now() - now}ms`);
      }),
    );
  }
}
