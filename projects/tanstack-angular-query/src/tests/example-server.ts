import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure.query(() => {
    return 'Hello world';
  }),

  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return { id: input.id, name: `User ${input.id}` };
    }),

  createUser: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return { id: Math.floor(Math.random() * 1000), name: input.name };
    }),

  updateUser: t.procedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(({ input }) => {
      return { id: input.id, name: input.name };
    }),

  deleteUser: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      return { success: true, deletedId: input.id };
    }),

  getUsers: t.procedure
    .input(z.object({
      cursor: z.number().optional(),
      limit: z.number().min(1).max(100).default(10)
    }))
    .query(({ input }) => {
      const { cursor = 0, limit } = input;
      const users = Array.from({ length: limit }, (_, i) => ({
        id: cursor + i + 1,
        name: `User ${cursor + i + 1}`
      }));

      return {
        users,
        nextCursor: cursor + limit < 100 ? cursor + limit : undefined
      };
    }),

  userSubscription: t.procedure
    .input(z.object({ userId: z.number() }))
    .subscription(({ input }) => {
      // Mock subscription that returns an observable
      return {
        [Symbol.asyncIterator]: async function* () {
          yield { userId: input.userId, message: 'Hello from subscription' };
        }
      };
    }),
});

export type AppRouter = typeof appRouter;
