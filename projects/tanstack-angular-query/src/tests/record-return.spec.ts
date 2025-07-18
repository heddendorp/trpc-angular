import { injectQuery, provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { beforeEach } from 'vitest';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';
import { TestBed } from '@angular/core/testing';
import { Component, effect, provideZonelessChangeDetection } from '@angular/core';
import { injectTRPC, provideTRPC } from '../lib/context';

@Component({
  template: `<div>Test Component</div>`,
})
class TestComponent {
  trpc = injectTRPC<AppRouter>();
  userDataQuery = injectQuery(()=>this.trpc.userContext.queryOptions());

  constructor() {
    effect(() => {
      const userData = this.userDataQuery.data();
      if(userData) {
        console.log('User Data:', userData.test);
      }
    });
  }
}

describe('correct inference of record types', () => {
  let queryClient: QueryClient;
  let trpcClient: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Create a real tRPC client (even if it will fail to connect, it has the right structure)
    trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
        }),
      ],
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(queryClient),
        provideTRPC(trpcClient),
      ],
    });
  });
})
