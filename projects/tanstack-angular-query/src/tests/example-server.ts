import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { observable } from '@trpc/server/observable';

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure.query(() => {
    return 'Hello world';
  }),

  greet: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
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

  // Admin routes
  admin: t.router({
    roles: t.router({
      findMany: t.procedure
        .input(z.object({}).optional())
        .query(({ input }) => {
          return [
            { id: 1, name: 'Admin' },
            { id: 2, name: 'User' },
            { id: 3, name: 'Guest' }
          ];
        })
    })
  }),

  // For infinite query tests
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

  // For subscription tests
  userUpdates: t.procedure
    .subscription(() => {
      return observable<{ id: number; name: string; action: 'created' | 'updated' | 'deleted' }>((emit) => {
        // Simulate user updates
        const timer = setInterval(() => {
          const actions = ['created', 'updated', 'deleted'] as const;
          const action = actions[Math.floor(Math.random() * actions.length)];
          emit.next({
            id: Math.floor(Math.random() * 1000),
            name: `User ${Math.floor(Math.random() * 1000)}`,
            action
          });
        }, 1000);

        return () => clearInterval(timer);
      });
    }),

  // For error handling tests
  errorQuery: t.procedure
    .input(z.object({ shouldError: z.boolean() }))
    .query(({ input }) => {
      if (input.shouldError) {
        throw new Error('Test error');
      }
      return { success: true };
    }),

  errorMutation: t.procedure
    .input(z.object({ shouldError: z.boolean() }))
    .mutation(({ input }) => {
      if (input.shouldError) {
        throw new Error('Test mutation error');
      }
      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;