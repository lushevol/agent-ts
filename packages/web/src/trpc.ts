import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '@agent-ts/api';

export const trpc = createTRPCReact<AppRouter>();

export interface CreateTrpcClientOptions {
  url?: string;
}

export function createTrpcClient({ url }: CreateTrpcClientOptions = {}) {
  const endpoint = url ?? '/api/trpc';
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) => process.env.NODE_ENV === 'development' || opts.direction === 'down'
      }),
      httpBatchLink({ url: endpoint })
    ]
  });
}
