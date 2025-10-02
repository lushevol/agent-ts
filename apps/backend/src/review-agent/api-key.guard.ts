import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly expectedKey = process.env.REVIEW_AGENT_API_KEY ?? 'demo-key';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] ?? request.headers['X-API-KEY'];

    if (typeof apiKey === 'string' && apiKey === this.expectedKey) {
      return true;
    }

    if (Array.isArray(apiKey) && apiKey.includes(this.expectedKey)) {
      return true;
    }

    throw new UnauthorizedException('Invalid API key');
  }
}
