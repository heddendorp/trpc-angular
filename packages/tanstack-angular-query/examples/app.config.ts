import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { provideTRPC } from '@trpc/tanstack-angular-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/router';

// Create the tRPC client with proper typing
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',
      // Optional: Add headers, custom fetch, etc.
      headers: () => {
        return {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        };
      },
    }),
  ],
});

// Configure Angular application
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      // Your routes here
    ]),
    provideHttpClient(),

    // TanStack Query provider
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
          },
        },
      }),
    ),

    // tRPC provider
    provideTRPC(trpcClient),
  ],
};
