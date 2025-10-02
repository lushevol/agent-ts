declare module '@nestjs/common' {
  export type ModuleMetadata = {
    imports?: unknown[];
    controllers?: unknown[];
    providers?: unknown[];
    exports?: unknown[];
  };

  export class NotFoundException extends Error {
    constructor(message?: string);
  }

  export class UnauthorizedException extends Error {
    constructor(message?: string);
  }

  export interface ExecutionContext {
    switchToHttp(): {
      getRequest<T extends { headers?: Record<string, string | undefined> } = { headers?: Record<string, string | undefined> }>(): T;
    };
  }

  export interface CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
  }

  export class Logger {
    constructor(context?: string);
    log(message: unknown, context?: string): void;
    warn(message: unknown, context?: string): void;
    error(message: unknown, trace?: unknown, context?: string): void;
    static log(message: unknown, context?: string): void;
    static warn(message: unknown, context?: string): void;
    static error(message: unknown, trace?: unknown, context?: string): void;
  }

  export function Module(metadata: ModuleMetadata): ClassDecorator;
  export function Controller(path?: string): ClassDecorator;
  export function Injectable(): ClassDecorator;
  export function Get(path?: string): MethodDecorator;
  export function Post(path?: string): MethodDecorator;
  export function Patch(path?: string): MethodDecorator;
  export function Delete(path?: string): MethodDecorator;
  export function Body(property?: string): ParameterDecorator;
  export function Param(property?: string): ParameterDecorator;
  export function Query(property?: string): ParameterDecorator;
  export function UseGuards(...guards: unknown[]): ClassDecorator & MethodDecorator;
}
