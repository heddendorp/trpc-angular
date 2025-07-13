import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/angular-query-experimental';
import {
  provideTRPC,
  injectTRPC,
  injectTRPCClient,
  createTRPCInjectors,
  TRPCService
} from '../lib/context';
import { createTRPCOptionsProxy, type TRPCOptionsProxy } from '../lib/createOptionsProxy';
import { AppRouter, appRouter } from './example-server';
import { Component, provideZonelessChangeDetection } from '@angular/core';

// Mock tRPC client for testing
const createMockTRPCClient = () => {
  return {
    query: vi.fn(),
    mutation: vi.fn(),
    subscription: vi.fn(),
  } as any;
};

describe('tanstack-angular-query', () => {
  let queryClient: QueryClient;
  let mockTRPCClient: ReturnType<typeof createMockTRPCClient>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockTRPCClient = createMockTRPCClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('createTRPCOptionsProxy', () => {
    it('should create a proxy with client', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      expect(proxy).toBeDefined();
      expect(proxy['hello']).toBeDefined();
      expect(proxy['getUser']).toBeDefined();
      expect(proxy['createUser']).toBeDefined();
    });

    it('should create a proxy with router and context', () => {
      const proxy = createTRPCOptionsProxy({
        router: appRouter,
        ctx: {},
        queryClient,
      });

      expect(proxy).toBeDefined();
      expect(proxy['hello']).toBeDefined();
      expect(proxy['getUser']).toBeDefined();
      expect(proxy['createUser']).toBeDefined();
    });

    it('should generate query options', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const queryOptions = (proxy['hello'] as any).queryOptions();
      expect(queryOptions).toBeDefined();
      expect(queryOptions.queryKey).toBeDefined();
      expect(queryOptions.queryFn).toBeDefined();
      expect(queryOptions.trpc).toBeDefined();
      expect(queryOptions.trpc.path).toBe('hello');
    });

    it('should generate query options with input', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const queryOptions = (proxy['getUser'] as any).queryOptions({ id: 1 });
      expect(queryOptions).toBeDefined();
      expect(queryOptions.queryKey).toEqual([['getUser'], { input: { id: 1 }, type: 'query' }]);
      expect(queryOptions.queryFn).toBeDefined();
      expect(queryOptions.trpc.path).toBe('getUser');
    });

    it('should generate mutation options', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const mutationOptions = (proxy['createUser'] as any).mutationOptions();
      expect(mutationOptions).toBeDefined();
      expect(mutationOptions.mutationKey).toEqual([['createUser']]);
      expect(mutationOptions.mutationFn).toBeDefined();
      expect(mutationOptions.trpc).toBeDefined();
      expect(mutationOptions.trpc.path).toBe('createUser');
    });

    it.todo('should generate infinite query options', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const infiniteOptions = (proxy['getUsers'] as any).infiniteQueryOptions({ limit: 10 });
      expect(infiniteOptions).toBeDefined();
      expect(infiniteOptions.queryKey).toEqual([['getUsers'], { input: { limit: 10 }, type: 'infinite' }]);
      expect(infiniteOptions.queryFn).toBeDefined();
      expect(infiniteOptions.initialPageParam).toBe(null);
      expect(infiniteOptions.trpc.path).toBe('getUsers');
    });

    it('should generate subscription options', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const subscriptionOptions = (proxy['userSubscription'] as any).subscriptionOptions({ userId: 1 });
      expect(subscriptionOptions).toBeDefined();
      expect(subscriptionOptions.queryKey).toEqual([['userSubscription'], { input: { userId: 1 }, type: 'query' }]);
      expect(subscriptionOptions.subscribe).toBeDefined();
      expect(subscriptionOptions.trpc.path).toBe('userSubscription');
    });

    it('should generate query keys', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const queryKey = (proxy['getUser'] as any).queryKey({ id: 1 });
      expect(queryKey).toEqual([['getUser'], { input: { id: 1 }, type: 'query' }]);

      const infiniteQueryKey = (proxy['getUsers'] as any).infiniteQueryKey({ limit: 10 });
      expect(infiniteQueryKey).toEqual([['getUsers'], { input: { limit: 10 }, type: 'infinite' }]);

      const mutationKey = (proxy['createUser'] as any).mutationKey();
      expect(mutationKey).toEqual([['createUser']]);
    });

    it('should generate path keys and filters', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const pathKey = (proxy['getUser'] as any).pathKey();
      expect(pathKey).toEqual([['getUser']]);

      const pathFilter = (proxy['getUser'] as any).pathFilter();
      expect(pathFilter).toEqual({
        queryKey: [['getUser']]
      });
    });

    it('should generate query and infinite query filters', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const queryFilter = (proxy['getUser'] as any).queryFilter({ id: 1 });
      expect(queryFilter).toEqual({
        queryKey: [['getUser'], { input: { id: 1 }, type: 'query' }]
      });

      const infiniteQueryFilter = (proxy['getUsers'] as any).infiniteQueryFilter({ limit: 10 });
      expect(infiniteQueryFilter).toEqual({
        queryKey: [['getUsers'], { input: { limit: 10 }, type: 'infinite' }]
      });
    });
  });

  describe('Context functions', () => {
    @Component({
      template: '',
      standalone: true,
    })
    class TestComponent {
      trpc = injectTRPC<AppRouter>();
      client = injectTRPCClient<AppRouter>();
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideTRPC(mockTRPCClient, queryClient),
        ],
      });
    });

    it('should provide TRPC client and options proxy', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc).toBeDefined();
      expect(component.client).toBeDefined();
      expect(component.trpc['hello']).toBeDefined();
      expect(component.client).toBe(mockTRPCClient);
    });

    it('should work with TRPCService', () => {
      const service = TestBed.inject(TRPCService);

      expect(service.getClient()).toBeDefined();
      expect(service.getOptionsProxy()).toBeDefined();
      expect(service.getClient()).toBe(mockTRPCClient);
    });

    it('should work with createTRPCInjectors', () => {
      const { injectTRPC: typedInjectTRPC, injectTRPCClient: typedInjectTRPCClient } = createTRPCInjectors<AppRouter>();

      TestBed.runInInjectionContext(() => {
        const trpc = typedInjectTRPC();
        const client = typedInjectTRPCClient();

        expect(trpc).toBeDefined();
        expect(client).toBeDefined();
        expect(trpc['hello']).toBeDefined();
        expect(client).toBe(mockTRPCClient);
      });
    });
  });

  describe('Options with different configurations', () => {
    it('should handle query options with custom configurations', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const queryOptions = (proxy['getUser'] as any).queryOptions({ id: 1 }, {
        enabled: false,
        staleTime: 5000,
        trpc: { ssr: false }
      });

      expect(queryOptions.enabled).toBe(false);
      expect(queryOptions.staleTime).toBe(5000);
      expect(queryOptions.trpc.path).toBe('getUser');
    });

    it.todo('should handle mutation options with custom configurations', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const onSuccess = vi.fn();
      const mutationOptions = (proxy['createUser'] as any).mutationOptions({
        onSuccess,
        trpc: { abortOnUnmount: false }
      });

      expect(mutationOptions.onSuccess).toBe(onSuccess);
      expect(mutationOptions.trpc.path).toBe('createUser');
    });

    it('should handle infinite query options with cursor configuration', () => {
      const proxy = createTRPCOptionsProxy({
        client: mockTRPCClient,
        queryClient,
      });

      const infiniteOptions = (proxy['getUsers'] as any).infiniteQueryOptions({ limit: 10 }, {
        initialCursor: 0,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
      });

      expect(infiniteOptions.initialPageParam).toBe(0);
      expect(infiniteOptions.getNextPageParam).toBeDefined();
    });
  });
});
