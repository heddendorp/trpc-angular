import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import {
  QueryClient,
  provideTanStackQuery,
} from '@tanstack/angular-query-experimental';
import { createTRPCOptionsProxy } from '../src/internals/createOptionsProxy';
import { provideTRPC, injectTRPC, createTRPCInjectors } from '../src/index';

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

// Mock HTTP handler
const mockHttpHandler = vi.fn();

describe('createTRPCOptionsProxy', () => {
  it('should export createTRPCOptionsProxy', () => {
    expect(createTRPCOptionsProxy).toBeDefined();
    expect(typeof createTRPCOptionsProxy).toBe('function');
  });

  it('should create options proxy with correct structure', () => {
    const mockClient = createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: '/trpc' })],
    });
    const queryClient = new QueryClient();

    const proxy = createTRPCOptionsProxy({ client: mockClient, queryClient });

    expect(proxy).toBeDefined();
    expect(proxy.greeting).toBeDefined();
    expect(proxy.user).toBeDefined();
    expect(proxy.user.list).toBeDefined();
    expect(proxy.user.create).toBeDefined();
  });
});

describe('package exports', () => {
  it('should be able to import from main entry', async () => {
    const module = await import('../src/index');
    expect(module.createTRPCOptionsProxy).toBeDefined();
    expect(module.provideTRPC).toBeDefined();
    expect(module.injectTRPC).toBeDefined();
    expect(module.injectTRPCClient).toBeDefined();
    expect(module.createTRPCInjectors).toBeDefined();
  });
});

describe('Angular integration', () => {
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
