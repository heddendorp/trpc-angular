import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  QueryClient,
  provideTanStackQuery,
} from '@tanstack/angular-query-experimental';
import { injectTRPC, provideTRPC } from '../public-api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

@Component({
  template: `<div>Test Component</div>`,
})
class TestComponent {
  trpc = injectTRPC<AppRouter>();
}

describe('tanstack-angular-query Basic Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Create a real tRPC client for testing
    const trpcClient = createTRPCClient<AppRouter>({
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

  describe('injectTRPC', () => {
    it('should inject TRPC proxy successfully', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc).toBeDefined();
      expect(typeof component.trpc).toBe('function'); // Proxy is technically a function
    });

    it('should provide access to query procedures', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc.hello).toBeDefined();
      expect(component.trpc.greet).toBeDefined();
      expect(component.trpc.getUser).toBeDefined();
    });

    it('should provide access to mutation procedures', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc.createUser).toBeDefined();
      expect(component.trpc.updateUser).toBeDefined();
      expect(component.trpc.deleteUser).toBeDefined();
    });

    it('should provide queryOptions method for query procedures', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc.hello.queryOptions).toBeDefined();
      expect(typeof component.trpc.hello.queryOptions).toBe('function');
    });

    it('should provide mutationOptions method for mutation procedures', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc.createUser.mutationOptions).toBeDefined();
      expect(typeof component.trpc.createUser.mutationOptions).toBe('function');
    });

    it('should provide infiniteQueryOptions method for appropriate procedures', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc.getUsers.infiniteQueryOptions).toBeDefined();
      expect(typeof component.trpc.getUsers.infiniteQueryOptions).toBe(
        'function',
      );
    });

    it('should provide subscriptionOptions method for subscription procedures', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      expect(component.trpc.userUpdates.subscriptionOptions).toBeDefined();
      expect(typeof component.trpc.userUpdates.subscriptionOptions).toBe(
        'function',
      );
    });
  });

  describe('Query Options Structure', () => {
    it('should generate query options with correct structure', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const options = component.trpc.hello.queryOptions();

      expect(options).toBeDefined();
      expect(options.queryKey).toBeDefined();
      expect(options.queryFn).toBeDefined();
      expect(typeof options.queryFn).toBe('function');
    });

    it('should generate query options with input', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const options = component.trpc.greet.queryOptions({ name: 'John' });

      expect(options).toBeDefined();
      expect(options.queryKey).toBeDefined();
      expect(options.queryFn).toBeDefined();
      expect(typeof options.queryFn).toBe('function');
    });
  });

  describe('Mutation Options Structure', () => {
    it('should generate mutation options with correct structure', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const options = component.trpc.createUser.mutationOptions();

      expect(options).toBeDefined();
      expect(options.mutationFn).toBeDefined();
      expect(typeof options.mutationFn).toBe('function');
    });
  });

  describe('Infinite Query Options Structure', () => {
    it('should generate infinite query options with correct structure', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const options = component.trpc.getUsers.infiniteQueryOptions(
        { limit: 10 },
        {
          initialCursor: 0,
          getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        },
      );

      expect(options).toBeDefined();
      expect(options.queryKey).toBeDefined();
      expect(options.queryFn).toBeDefined();
      expect(typeof options.queryFn).toBe('function');
      expect(options.getNextPageParam).toBeDefined();
    });
  });

  describe('Subscription Options Structure', () => {
    it('should generate subscription options with correct structure', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const options = component.trpc.userUpdates.subscriptionOptions();

      expect(options).toBeDefined();
      expect(options.subscribe).toBeDefined();
      expect(typeof options.subscribe).toBe('function');
    });
  });
});
