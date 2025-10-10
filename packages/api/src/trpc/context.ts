import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { DatabaseClient } from '@agent-ts/db';

export interface ContextFactoryOptions {
  db: DatabaseClient;
}

export type TrpcContext = {
  db: DatabaseClient;
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
};

export function createContextFactory({ db }: ContextFactoryOptions) {
  return ({ req, res }: CreateExpressContextOptions): TrpcContext => ({
    db,
    req,
    res
  });
}
