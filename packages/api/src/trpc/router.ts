import { initTRPC } from '@trpc/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { users } from '@agent-ts/db';
import { insertUserSchema, selectUserSchema, userIdSchema, type SelectUser } from '@agent-ts/shared/schemas/users';
import type { TrpcContext } from './context';

const t = initTRPC.context<TrpcContext>().create();

export const createRouter = t.router;
export const publicProcedure = t.procedure;

export const appRouter = createRouter({
  getUsers: publicProcedure.query(async ({ ctx }): Promise<SelectUser[]> => {
    const records = await ctx.db.select().from(users).orderBy(asc(users.createdAt));
    return records;
  }),
  getUserById: publicProcedure
    .input(
      z.object({
        id: userIdSchema
      })
    )
    .query(async ({ ctx, input }) => {
      const [record] = await ctx.db.select().from(users).where(eq(users.id, input.id));
      return record ?? null;
    }),
  addUser: publicProcedure.input(insertUserSchema).mutation(async ({ ctx, input }) => {
    const now = new Date();
    const [record] = await ctx.db
      .insert(users)
      .values({
        ...input,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return selectUserSchema.parse(record);
  }),
  updateUserName: publicProcedure
    .input(
      z.object({
        id: userIdSchema,
        name: z.string().min(1, 'Name is required')
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          updatedAt: new Date()
        })
        .where(eq(users.id, input.id))
        .returning();

      if (!record) {
        throw new Error(`User ${input.id} not found`);
      }

      return selectUserSchema.parse(record);
    })
});

export type AppRouter = typeof appRouter;
export type { TrpcContext };
