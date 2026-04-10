import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger('ZodValidation');

  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    this.logger.debug(`Received type=${typeof value} value=${JSON.stringify(value).substring(0, 200)}`);

    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        // let Zod handle the error
      }
    }

    const result = this.schema.safeParse(parsed);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors,
      });
    }

    return result.data;
  }
}
