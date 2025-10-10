import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { DatabaseClient } from '@agent-ts/db';
import { appRouter } from './trpc/router';
import { createContextFactory } from './trpc/context';

export interface TrpcMiddlewareOptions {
  db: DatabaseClient;
}

export function createTrpcMiddleware({ db }: TrpcMiddlewareOptions) {
  const createContext = createContextFactory({ db });
  return createExpressMiddleware({ router: appRouter, createContext });
}

export type { AppRouter } from './trpc/router';
export { appRouter };
