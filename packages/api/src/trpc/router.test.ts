import { describe, expect, it } from 'vitest';
import { appRouter } from './router';
import type { TrpcContext } from './context';
import type { DatabaseClient } from '@agent-ts/db';
import type { SelectUser } from '@agent-ts/shared/schemas/users';

function createTestContext() {
  const records: SelectUser[] = [];

  const db = {
    select: () => ({
      from: () => ({
        orderBy: () => Promise.resolve([...records]),
        where: () => Promise.resolve([...records])
      })
    }),
    insert: () => ({
      values: (input: Partial<SelectUser> & { name: string; email: string }) => ({
        returning: () => {
          const next: SelectUser = {
            id: records.length + 1,
            createdAt: input.createdAt ?? new Date(),
            updatedAt: input.updatedAt ?? new Date(),
            email: input.email,
            name: input.name
          };
          records.push(next);
          return Promise.resolve([next]);
        }
      })
    }),
    update: () => ({
      set: (values: Partial<SelectUser>) => ({
        where: () => ({
          returning: () => {
            const current = records[records.length - 1];
            if (!current) {
              return Promise.resolve([] as SelectUser[]);
            }
            const updated = { ...current, ...values, updatedAt: values.updatedAt ?? current.updatedAt };
            records[records.length - 1] = updated;
            return Promise.resolve([updated]);
          }
        })
      })
    })
  } satisfies Partial<DatabaseClient>;

  const ctx: TrpcContext = {
    db: db as DatabaseClient,
    req: {} as never,
    res: {} as never
  };

  return { ctx, records };
}

describe('appRouter', () => {
  it('creates and lists users', async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.addUser({
      email: 'jane@example.com',
      name: 'Jane Doe'
    });

    expect(created.email).toBe('jane@example.com');

    const users = await caller.getUsers();
    expect(users).toHaveLength(1);
    expect(users[0]?.name).toBe('Jane Doe');
  });
});
