/**
 * Example showing how to use SuperJSON transformer with Angular HTTP link
 *
 * This demonstrates the fix for the TypeScript error:
 * "Type 'typeof SuperJSON' is not assignable to type 'true'"
 */

import { HttpClient } from '@angular/common/http';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '@heddendorp/trpc-link-angular';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

// Server-side router with SuperJSON transformer
const t = initTRPC.create({
  transformer: superjson,
});

const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return {
        id: input.id,
        name: 'John Doe',
        createdAt: new Date(), // Date will be properly serialized/deserialized
      };
    }),

  createPost: t.procedure
    .input(
      z.object({
        title: z.string(),
        publishedAt: z.date(),
        tags: z.array(z.string()),
      }),
    )
    .mutation(({ input }) => {
      return {
        id: Math.random().toString(36),
        title: input.title,
        publishedAt: input.publishedAt, // Date object preserved
        tags: input.tags,
        createdAt: new Date(),
      };
    }),
});

type AppRouter = typeof appRouter;

// Client-side setup in Angular component/service
export function createTRPCClientExample(httpClient: HttpClient) {
  // This now works without TypeScript errors!
  const client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient,
        transformer: superjson, // ✅ No longer causes TypeScript error
      }),
    ],
  });

  return client;
}

// Usage example
export async function exampleUsage(httpClient: HttpClient) {
  const client = createTRPCClientExample(httpClient);

  // Query with Date handling
  const user = await client.getUser.query({ id: '123' });
  console.log('User created at:', user.createdAt); // Will be a proper Date object

  // Mutation with Date input
  const post = await client.createPost.mutate({
    title: 'My Blog Post',
    publishedAt: new Date('2023-01-01'), // Date object as input
    tags: ['typescript', 'angular', 'trpc'],
  });
  console.log('Post published at:', post.publishedAt); // Will be a proper Date object
}

// Alternative: Custom transformer
export function createClientWithCustomTransformer(httpClient: HttpClient) {
  const client = createTRPCClient<AppRouter>({
    links: [
      angularHttpLink({
        url: 'http://localhost:3000/trpc',
        httpClient,
        transformer: {
          serialize: (data) => JSON.stringify(data),
          deserialize: (data) => JSON.parse(data),
        },
      }),
    ],
  });

  return client;
}
