declare module '@nestjs/core' {
  export interface NestApplication {
    setGlobalPrefix(prefix: string): void;
    listen(port: number): Promise<void>;
  }

  export const NestFactory: {
    create(module: unknown, options?: unknown): Promise<NestApplication>;
  };
}
