import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ProjectId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.params.projectId as string;
});
