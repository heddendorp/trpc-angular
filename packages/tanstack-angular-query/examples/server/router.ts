import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Observable } from 'rxjs';

// Initialize tRPC
const t = initTRPC.create();

// Example router with different procedure types
export const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
    }),

  user: t.router({
    list: t.procedure.query(() => {
      // In a real app, this would fetch from database
      return [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];
    }),

    byId: t.procedure.input(z.object({ id: z.number() })).query(({ input }) => {
      // In a real app, this would fetch from database
      const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];
      return users.find((user) => user.id === input.id);
    }),

    create: t.procedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
      )
      .mutation(({ input }) => {
        // In a real app, this would save to database
        const newUser = {
          id: Math.floor(Math.random() * 1000),
          name: input.name,
          email: input.email,
        };
        return newUser;
      }),

    update: t.procedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
        }),
      )
      .mutation(({ input }) => {
        // In a real app, this would update in database
        return {
          id: input.id,
          name: input.name || 'Updated Name',
          email: input.email || 'updated@example.com',
        };
      }),

    delete: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        // In a real app, this would delete from database
        return { success: true, deletedId: input.id };
      }),
  }),

  posts: t.router({
    list: t.procedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).optional(),
          cursor: z.string().optional(),
        }),
      )
      .query(({ input }) => {
        const limit = input.limit ?? 10;
        const cursor = input.cursor ? parseInt(input.cursor) : 0;

        // Mock paginated data
        const posts = Array.from({ length: limit }, (_, i) => ({
          id: cursor + i + 1,
          title: `Post ${cursor + i + 1}`,
          content: `Content for post ${cursor + i + 1}`,
        }));

        return {
          posts,
          nextCursor:
            cursor + limit < 100 ? (cursor + limit).toString() : undefined,
        };
      }),
  }),

  // Subscription example (requires WebSocket setup)
  onPostCreate: t.procedure.subscription(() => {
    // This would typically use an EventEmitter or similar
    // For demonstration purposes only
    return new Observable((observer) => {
      const interval = setInterval(() => {
        observer.next({
          id: Date.now(),
          title: `New Post ${Date.now()}`,
          content: 'New post content',
        });
      }, 5000);

      return () => clearInterval(interval);
    });
  }),
});

// Export the router type - this is crucial for client-side typing
export type AppRouter = typeof appRouter;
