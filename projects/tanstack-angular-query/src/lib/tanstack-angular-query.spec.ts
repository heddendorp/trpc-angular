import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import {
  QueryClient,
  provideTanStackQuery,
} from '@tanstack/angular-query-experimental';
import { provideTRPC, injectTRPC, createTRPCInjectors } from './tanstack-angular-query';
import { Component } from '@angular/core';

// Mock server setup
const t = initTRPC.create();
const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
    }),
  user: t.router({
    list: t.procedure.query(() => {
      return [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ];
    }),
    create: t.procedure
      .input(z.object({ name: z.string() }))
      .mutation(({ input }) => {
        return { id: 3, name: input.name };
      }),
  }),
});

type AppRouter = typeof appRouter;

describe('TanstackAngularQuery', () => {
  let queryClient: QueryClient;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    trpcClient = createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: '/trpc' })],
    });
  });

  it('should provide tRPC client through Angular DI', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
    }

    TestBed.configureTestingModule({
      providers: [provideTanStackQuery(queryClient), provideTRPC(trpcClient)],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.trpc).toBeDefined();
    expect(component.trpc.greeting).toBeDefined();
    expect(component.trpc.user).toBeDefined();
    expect(component.trpc.user.list).toBeDefined();
    expect(component.trpc.user.create).toBeDefined();
  });

  it('should create query options with correct structure', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
    }

    TestBed.configureTestingModule({
      providers: [provideTanStackQuery(queryClient), provideTRPC(trpcClient)],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    const greetingOptions = component.trpc.greeting.queryOptions({
      name: 'World',
    });

    expect(greetingOptions).toBeDefined();
    expect(greetingOptions.queryKey).toBeDefined();
    expect(greetingOptions.queryFn).toBeDefined();
    expect(greetingOptions.trpc).toBeDefined();
  });

  it('should create mutation options with correct structure', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
    }

    TestBed.configureTestingModule({
      providers: [provideTanStackQuery(queryClient), provideTRPC(trpcClient)],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    const createUserOptions = component.trpc.user.create.mutationOptions();

    expect(createUserOptions).toBeDefined();
    expect(createUserOptions.mutationKey).toBeDefined();
    expect(createUserOptions.mutationFn).toBeDefined();
    expect(createUserOptions.trpc).toBeDefined();
  });

  it('should work with createTRPCInjectors for typed injection', () => {
    const {
      injectTRPC: injectTypedTRPC,
      injectTRPCClient: injectTypedTRPCClient,
    } = createTRPCInjectors<AppRouter>();

    @Component({
      template: '',
    })
    class TestComponent {
      trpc = injectTypedTRPC();
      client = injectTypedTRPCClient();
    }

    TestBed.configureTestingModule({
      providers: [provideTanStackQuery(queryClient), provideTRPC(trpcClient)],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    expect(component.trpc).toBeDefined();
    expect(component.trpc.greeting).toBeDefined();
    expect(component.trpc.user).toBeDefined();
    expect(component.trpc.user.list).toBeDefined();
    expect(component.trpc.user.create).toBeDefined();
    expect(component.client).toBeDefined();
  });
});
