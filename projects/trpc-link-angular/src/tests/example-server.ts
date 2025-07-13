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
});

export type AppRouter = typeof appRouter;
